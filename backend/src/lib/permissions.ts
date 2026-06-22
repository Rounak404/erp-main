import { createAccessControl } from 'better-auth/plugins/access'
import { adminAc, defaultStatements } from 'better-auth/plugins/admin/access' // 💡 Import the default admin access control

const statement = {
  ...defaultStatements,
  student_profile: ['create', 'read', 'update', 'delete'],
  teacher_profile: ['create', 'read', 'update', 'delete'],
  grade: ['create', 'read', 'update', 'delete'],
  attendance: ['mark', 'read', 'update', 'delete'],
  course: ['create', 'read', 'update', 'delete'],
} as const

export const ac = createAccessControl(statement)

export const admin = ac.newRole({
  student_profile: ['create', 'read', 'update', 'delete'],
  teacher_profile: ['create', 'read', 'update', 'delete'],
  grade: ['create', 'read', 'update', 'delete'],
  attendance: ['mark', 'read', 'update', 'delete'],
  course: ['create', 'read', 'update', 'delete'],
  ...adminAc.statements,
})

export const teacher = ac.newRole({
  student_profile: ['read'],
  teacher_profile: ['read', 'update'],
  grade: ['create', 'read', 'update'],
  attendance: ['mark', 'read', 'update'],
  course: ['read'],
})

export const student = ac.newRole({
  student_profile: ['read', 'update'],
  teacher_profile: ['read'],
  grade: ['read'],
  attendance: ['read'],
  course: ['read'],
})
