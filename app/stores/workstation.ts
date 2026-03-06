import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Patient, AIDetection, ExamFinding, SystemConfig, ConnectionStatus } from '@/app/types'

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
    { id: '1', organ: '甲状腺', location: '右叶中部', size: '8.2mm x 5.1mm', confidence: 0.94, type: '低回声结节' },
    { id: '2', organ: '甲状腺', location: '左叶下极', size: '4.5mm x 3.2mm', confidence: 0.87, type: '囊性结节' },
  ])

  // Findings
  const examFinding = ref<ExamFinding>({
    organ: '甲状腺',
    location: '右叶中部',
    size: '8.2mm x 5.1mm',
    echoFeature: '低回声',
    boundary: '边界清晰',
    bloodFlow: '周边可见少许血流信号',
    description: '甲状腺右叶中部可见一低回声结节，大小约8.2mm x 5.1mm，边界清晰，形态规则，内部回声均匀，周边可见少许血流信号。TI-RADS 3类。'
  })

  const diagnosis = ref('考虑甲状腺良性结节（TI-RADS 3类），建议6个月后复查。')
  const isCritical = ref(false)
  const examResult = ref<'阳性' | '阴性'>('阳性')

  // Screenshots
  const screenshots = ref<string[]>([])
  const frameCount = ref(0)

  // Voice
  const isRecording = ref(false)
  const voiceText = ref('')

  // Config
  const config = ref<SystemConfig>({
    serverAddress: '192.168.1.100',
    serverPort: 8080,
    deviceId: 'US-STATION-001',
    turnServerAddress: 'turn.hospital.local',
    turnUsername: 'ultrasound',
    turnPassword: '',
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

  function addScreenshot(url: string) {
    screenshots.value.push(url)
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
    toggleRecording,
    updateConfig,
  }
})
