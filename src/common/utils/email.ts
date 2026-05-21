import { Resend } from 'resend'
import 'dotenv/config'

export interface SendEmailOptions {
  to: string    
  subject: string
  html: string
}

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendEmail = async ({to,subject,html}: SendEmailOptions) => {
    const { data, error } = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: to,
      subject: subject,
      html: html,
    })
    
    if (error){
        return error
    }
    return data
}