export interface Patient {
  id: string
  name: string
  age: number
  gender: '男' | '女'
  examPart: string
  examId: string
  examTime: string
  status: '已登记' | '检查中' | '已完成'
}

export interface AIDetection {
  id: string
  organ: string
  location: string
  size: string
  confidence: number
  type: string
  grade?: string
}

export type ConnectionStatus = '未连接' | '已连接' | '连接中' | '连接错误' | '已断开' | 'AI分析中'

export interface ExamFinding {
  organ: string
  location: string
  size: string
  echoFeature: string
  boundary: string
  bloodFlow: string
  description: string
}

export interface QualityControlItem {
  id: string
  patientName: string
  gender: '男' | '女'
  examPart: string
  qcType: '历史报告冲突' | '逻辑矛盾' | '完整性问题'
  detail: string
  time: string
  status: '待审核' | '已通过' | '已驳回'
}

export interface Screenshot {
  id: string
  dataUrl: string
  timestamp: number
  label: string
  organ?: string
}

export interface ReportData {
  patientInfo: Patient
  findings: ExamFinding
  diagnosis: string
  isCritical: boolean
  result: '阳性' | '阴性'
  doctorName: string
  screenshots: Screenshot[]
}

export interface SystemConfig {
  serverAddress: string
  serverPort: number
  deviceId: string
  turnServerAddress: string
  turnUsername: string
  turnPassword: string
  aiConfidenceThreshold: number
}


