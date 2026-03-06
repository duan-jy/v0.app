import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Patient, AIDetection, ExamFinding, SystemConfig, ConnectionStatus, Screenshot } from '@/app/types'

export const useWorkstationStore = defineStore('workstation', () => {
  // Patients
  const patients = ref<Patient[]>([
    { id: 'US20260306001', name: '张伟', age: 45, gender: '男', examPart: '甲状腺', examId: 'US20260306001', examTime: '2026-03-06 08:30', status: '检查中' },
    { id: 'US20260306002', name: '李芳', age: 38, gender: '女', examPart: '乳腺', examId: 'US20260306002', examTime: '2026-03-06 09:00', status: '已登记' },
    { id: 'US20260306003', name: '王磊', age: 52, gender: '男', examPart: '肝胆', examId: 'US20260306003', examTime: '2026-03-06 09:30', status: '已登记' },
    { id: 'US20260306004', name: '赵敏', age: 29, gender: '女', examPart: '甲状腺', examId: 'US20260306004', examTime: '2026-03-06 10:00', status: '已完成' },
    { id: 'US20260306005', name: '陈刚', age: 61, gender: '男', examPart: '颈动脉', examId: 'US20260306005', examTime: '2026-03-06 10:30', status: '已登记' },
    { id: 'US20260306006', name: '刘娟', age: 44, gender: '女', examPart: '乳腺', examId: 'US20260306006', examTime: '2026-03-06 11:00', status: '已完成' },
  ])

  const currentPatient = ref<Patient | null>(patients.value[0])

  // AI
  const connectionStatus = ref<ConnectionStatus>('未连接')
  const aiDetections = ref<AIDetection[]>([
    { 
      id: '1', 
      organ: '甲状腺', 
      location: '右叶中部', 
      size: '8.2mm x 5.1mm x 4.8mm', 
      confidence: 0.94, 
      type: '实性结节',
      grade: '4a',
      shape: '不规则',
      aspectRatio: '小于1',
      margin: '模糊',
      echoPattern: '低回声',
      posteriorFeature: '无改变',
      calcification: '微钙化',
      bloodFlow: '内部血供',
      bloodRichness: '较丰富',
      capsuleInvasion: false,
      lymphNode: '未见异常'
    },
    { 
      id: '2', 
      organ: '甲状腺', 
      location: '左叶下极', 
      size: '4.5mm x 3.2mm x 3.0mm', 
      confidence: 0.87, 
      type: '囊性结节',
      grade: '2',
      shape: '规则',
      aspectRatio: '小于1',
      margin: '完整',
      echoPattern: '无回声',
      posteriorFeature: '增强',
      calcification: '无',
      bloodFlow: '无血供',
      bloodRichness: '不丰富',
      capsuleInvasion: false,
      lymphNode: ''
    },
  ])

  // Findings
  const examFinding = ref<ExamFinding>({
    organ: '甲状腺',
    location: '右叶中部',
    size: '8.2mm x 5.1mm x 4.8mm',
    echoFeature: '低回声',
    boundary: '边界模糊',
    bloodFlow: '内部可见点状血流信号',
    description: '',
    thyroid: {
      leftLobeSize: '48mm x 18mm x 16mm',
      rightLobeSize: '50mm x 20mm x 18mm',
      isthmusThickness: '3mm',
      capsuleIntegrity: '光整',
      internalEcho: '不均匀',
      bloodFlowPattern: '正常',
      parathyroidStatus: '未见异常',
      lymphNodeStatus: '未见异常肿大淋巴结',
      lymphNodeDetail: ''
    },
    tiradsVersion: 'C-TIRADS',
    tiradsCategory: '4a',
    recommendation: '建议行FNA细针穿刺活检'
  })

  const diagnosis = ref('')
  const isCritical = ref(false)
  const examResult = ref<'阳性' | '阴性'>('阳性')

  // Screenshots
  const screenshots = ref<Screenshot[]>([])
  const frameCount = ref(0)

  // Voice
  const isRecording = ref(false)
  const voiceText = ref('')

  // Config
  const config = ref<SystemConfig>({
    serverAddress: '10.68.73.23',
    serverPort: 8000,
    deviceId: 'US-STATION-001',
    turnServerAddress: '10.68.73.23',
    turnUsername: 'user',
    turnPassword: 'pass',
    aiConfidenceThreshold: 0.75,
  })

  const showConfigModal = ref(false)

  // Computed
  const todayStats = computed(() => ({
    total: patients.value.length,
    registered: patients.value.filter(p => p.status === '已登记').length,
    inProgress: patients.value.filter(p => p.status === '检查中').length,
    completed: patients.value.filter(p => p.status === '已完成').length,
  }))

  // Actions
  function selectPatient(patient: Patient) {
    currentPatient.value = patient
  }

  function addScreenshot(dataUrl: string, label?: string, organ?: string) {
    const shot: Screenshot = {
      id: `shot_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      dataUrl,
      timestamp: Date.now(),
      label: label || `截图 ${screenshots.value.length + 1}`,
      organ,
    }
    screenshots.value.push(shot)
  }

  function replaceScreenshot(id: string, newDataUrl: string) {
    const idx = screenshots.value.findIndex(s => s.id === id)
    if (idx !== -1) {
      screenshots.value[idx].dataUrl = newDataUrl
      screenshots.value[idx].timestamp = Date.now()
    }
  }

  function removeScreenshot(id: string) {
    screenshots.value = screenshots.value.filter(s => s.id !== id)
  }

  function updateScreenshotLabel(id: string, label: string) {
    const shot = screenshots.value.find(s => s.id === id)
    if (shot) {
      shot.label = label
    }
  }

  function toggleRecording() {
    isRecording.value = !isRecording.value
    if (isRecording.value) {
      voiceText.value = ''
    }
  }

  function updateConfig(newConfig: SystemConfig) {
    config.value = newConfig
    showConfigModal.value = false
  }

  return {
    patients,
    currentPatient,
    connectionStatus,
    aiDetections,
    examFinding,
    diagnosis,
    isCritical,
    examResult,
    screenshots,
    frameCount,
    isRecording,
    voiceText,
    config,
    showConfigModal,
    todayStats,
    selectPatient,
    addScreenshot,
    replaceScreenshot,
    removeScreenshot,
    updateScreenshotLabel,
    toggleRecording,
    updateConfig,
  }
})
