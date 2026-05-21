export interface CreateClassRoomData {
  grade: string
  section: string
}

export interface AssignSubjectToClassData {
  classRoomId: string
  subjectId: string
  teacherId?: string | null
}
