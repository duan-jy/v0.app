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
  // Thyroid-specific fields (based on C-TIRADS standard)
  shape?: '规则' | '不规则' | ''
  aspectRatio?: '小于1' | '大于等于1' | ''
  margin?: '完整' | '不完整' | '模糊' | '毛刺' | '成角' | ''
  echoPattern?: '无回声' | '高回声' | '囊实性混合回声' | '低回声' | '等回声' | '不均匀回声' | ''
  posteriorFeature?: '无改变' | '衰减声影' | '增强' | '混合性改变' | ''
  calcification?: '无' | '微钙化' | '粗大钙化' | '蛋壳样钙化' | ''
  bloodFlow?: '无血供' | '内部血供' | '边缘血供' | '内部和边缘血供' | ''
  bloodRichness?: '不丰富' | '较丰富' | '丰富' | ''
  capsuleInvasion?: boolean
  lymphNode?: string
}

export type ConnectionStatus = '未连接' | '已连接' | '连接中' | '连接错误' | '已断开' | 'AI分析中'

export interface ThyroidFinding {
  // Basic gland description
  leftLobeSize: string // e.g., "50mm x 20mm x 18mm"
  rightLobeSize: string
  isthmusThickness: string
  capsuleIntegrity: '光整' | '不光整' | ''
  internalEcho: '均匀' | '不均匀' | ''
  bloodFlowPattern: '正常' | '增多' | '减少' | ''
  parathyroidStatus: '未见异常' | '可见异常回声' | ''
  lymphNodeStatus: '未见异常肿大淋巴结' | '可见异常淋巴结' | ''
  lymphNodeDetail?: string
}

export interface ExamFinding {
  organ: string
  location: string
  size: string
  echoFeature: string
  boundary: string
  bloodFlow: string
  description: string
  // Thyroid-specific structured finding
  thyroid?: ThyroidFinding
  // TI-RADS classification info
  tiradsVersion?: 'C-TIRADS' | 'K-TIRADS' | 'ACR-TIRADS' | ''
  tiradsCategory?: string
  recommendation?: string
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


