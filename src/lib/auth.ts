import { betterAuth, User } from 'better-auth'
import { admin as adminPlugin } from 'better-auth/plugins'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from './prisma'
import { sendEmail } from '../common/utils/email'
import { APIError, createAuthMiddleware } from 'better-auth/api'
import {
  requestPasswordResetSchema,
  sendResetPasswordSchema,
  signInSchema,
  signUpSchema,
} from '../features/Auth/auth.schema'
import { ChangePasswordSchema } from '../features/Users/users.schema'
import { ac, student, teacher, admin } from './permissions'

type SendVerificationEmailData = {
  user: User
  url: string
  token: string
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  user: {
    modelName: 'users',
    fields: {
      image: 'profileImage',
    },
    additionalFields: {
      role: {
        type: 'string',
        required: true,
        defaultValue: 'STUDENT',
        input: false,
      },
      phoneNo: {
        type: 'string',
        required: false,
        defaultValue: '',
      },
    },
  },
  baseURL: process.env.BETTER_AUTH_URL,
  basePath: '/api/v1/auth',
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['google'],
      allowDifferentEmails: false,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    // revokeSessionsOnPasswordReset: true,
    minPasswordLength: 6,
    onExistingUserSignUp: async ({ user }, request) => {
      void sendEmail({
        to: user.email,
        subject: 'Sign-up attempt with your email',
        html: `
          <div
              style=font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
              "
          >

              <h2>
                Account Already Exists
              </h2>

              <p>
                Someone tried to create an account
                using your email address.
              </p>

              <p>
                If this was you, try signing in
                instead.
              </p>

              <p>
                If not, you can safely ignore
                this email.
              </p>

              <br />

              <p>
                — ERP Team
              </p>

          </div>
        `,
      })
    },
    customSyntheticUser: ({ coreFields, additionalFields, id }) => ({
      ...coreFields,
      role: additionalFields.role ?? 'STUDENT',
      phoneNo: additionalFields.phoneNo ?? null,
      profileImage: additionalFields.profileImage ?? null,
      id,
    }),
    sendResetPassword: async ({ user, url, token }, request) => {
      void sendEmail({
        to: user.email,
        subject: 'Reset your password',
        html: `Click the link to reset your password: ${url}`,
      })
    },
    onPasswordReset: async ({ user }, request) => {
      // your logic here
      console.log(`Password for user ${user.email} has been reset.`)
    },
    emailVerification: {
      sendVerificationEmail: async (
        data: SendVerificationEmailData,
        request: Request
      ) => {
        await sendEmail({
          to: data.user.email,
          subject: 'Verify your email address',
          html: `
                <div
                    style="
                      font-family: Arial, sans-serif;
                      line-height: 1.6;
                      color: #333;
                    "
                >

                    <h2>
                      Account Already Exists
                    </h2>

                    <p>
                      Someone tried to create an account
                      using your email address.
                    </p>

                    <p>
                      If this was you, try signing in
                      instead.
                    </p>

                    <p>
                      If not, you can safely ignore
                      this email.
                    </p>

                    <br />

                    <p>
                      — ERP Team
                    </p>

                </div>
              `,
        })
      },
    },
    autoSignIn: true,
  },
  socialProviders: {
    google: {
      prompt: 'select_account',
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  advanced: {
    cookiePrefix: 'my-app',
    // useSecureCookies:true,
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === '/sign-up/email') {
        try {
          signUpSchema.parse(ctx.body)
        } catch (error: any) {
          throw new APIError('BAD_REQUEST', {
            message: error.errors?.[0]?.message || 'Invalid Signup Data',
          })
        }
      }
      if (ctx.path === '/admin/create-user') {
        try {
          signUpSchema.parse(ctx.body)
        } catch (error: any) {
          throw new APIError('BAD_REQUEST', {
            message: error.errors?.[0]?.message || 'Invalid Signup Data',
          })
        }
      }
      if (ctx.path === '/sign-in/email') {
        try {
          signInSchema.parse(ctx.body)
        } catch (error: any) {
          throw new APIError('BAD_REQUEST', {
            message: error.errors?.[0]?.message || 'Invalid Signup Data',
          })
        }
      }
      if (ctx.path === '/request-password-reset') {
        try {
          requestPasswordResetSchema.parse(ctx.body)
        } catch (error: any) {
          throw new APIError('BAD_REQUEST', {
            message: error.errors?.[0]?.message || 'Invalid Signup Data',
          })
        }
      }
      if (ctx.path === '/reset-password') {
        try {
          sendResetPasswordSchema.parse(ctx.body)
        } catch (error: any) {
          throw new APIError('BAD_REQUEST', {
            message: error.errors?.[0]?.message || 'Invalid Signup Data',
          })
        }
      }
      if (ctx.path === '/change-password') {
        try {
          ChangePasswordSchema.parse(ctx.body)
        } catch (error: any) {
          throw new APIError('BAD_REQUEST', {
            message: error.errors?.[0]?.message || 'Invalid Signup Data',
          })
        }
      }
    }),
  },
  databaseHooks: {
    user: {
      create: {
        after: async (createdUser, ctx) => {
          if (!ctx?.context?.body) return
          const customData = ctx.body.data || {}
          await prisma.$transaction(async (tx) => {
            if (createdUser.role === 'student') {
              if (!customData.rollNumber) {
                throw new APIError('BAD_REQUEST', {
                  message: 'Roll number is required for students',
                })
              }
              await tx.student.create({
                data: {
                  userId: createdUser.id,
                  rollNumber: customData.rollNumber,
                  class: customData.class,
                  admissionDate: customData.admissionDate
                    ? new Date(customData.admissionDate)
                    : new Date(),
                },
              })
            } else if (createdUser.role === 'teacher') {
              if (!customData.department) {
                throw new APIError('BAD_REQUEST', {
                  message: 'Department is required for teachers',
                })
              }
              await tx.teacher.create({
                data: {
                  userId: createdUser.id,
                  employeeId: customData.employeeId,
                  joiningDate: customData.joiningDate
                    ? new Date(customData.joiningDate)
                    : new Date(),
                },
              })
            }
          })
        },
      },
    },
  },
  plugins: [
    adminPlugin({
      ac,
      roles: {
        admin,
        teacher,
        student,
      },
      defaultRole: 'STUDENT',
      adminUserIds: ['user_id_1', 'user_id_2'],
    }),
  ],
})
