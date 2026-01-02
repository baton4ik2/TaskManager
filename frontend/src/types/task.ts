export interface Task {
  id: number
  title: string
  description?: string
  key: string
  type: 'TASK' | 'BUG' | 'STORY' | 'EPIC'
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  projectId: number
  projectName: string
  reporterId: number
  reporterUsername: string
  assigneeId?: number
  assigneeUsername?: string
  createdAt: string
  updatedAt: string
}

