<template>
  <div class="flex flex-col h-screen bg-background overflow-hidden">
    <HeaderBar />

    <div class="flex-1 overflow-y-auto p-6">
      <div class="max-w-6xl mx-auto">
        <!-- Page Title -->
        <div class="flex items-center gap-3 mb-6">
          <RouterLink
            to="/"
            class="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft class="w-4 h-4 text-foreground" />
          </RouterLink>
          <div>
            <h1 class="text-xl font-bold text-foreground">AI质控中心</h1>
            <p class="text-sm text-muted-foreground">报告质量控制与统计分析</p>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-4 gap-4 mb-6">
          <div
            v-for="stat in statsCards"
            :key="stat.label"
            class="bg-card rounded-xl shadow-sm border border-border p-4"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-muted-foreground">{{ stat.label }}</span>
              <div
                class="flex items-center justify-center w-8 h-8 rounded-lg"
                :class="stat.iconBg"
              >
                <component :is="stat.icon" class="w-4 h-4" :class="stat.iconColor" />
              </div>
            </div>
            <div class="text-2xl font-bold text-foreground">{{ stat.value }}</div>
            <div class="text-xs text-muted-foreground mt-1">{{ stat.sub }}</div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-3 gap-4 mb-6">
          <!-- Daily QC Chart -->
          <div class="bg-card rounded-xl shadow-sm border border-border p-4 col-span-1">
            <h3 class="text-sm font-bold text-foreground mb-4">每日质控数量</h3>
            <div class="flex items-end gap-2 h-36">
              <div
                v-for="(bar, idx) in dailyData"
                :key="idx"
                class="flex-1 flex flex-col items-center gap-1"
              >
                <span class="text-[10px] text-muted-foreground font-mono">{{ bar.value }}</span>
                <div
                  class="w-full rounded-t-sm transition-all bg-primary/80"
                  :style="{ height: `${(bar.value / maxDailyValue) * 100}%` }"
                ></div>
                <span class="text-[10px] text-muted-foreground">{{ bar.day }}</span>
              </div>
            </div>
          </div>

          <!-- Error Type Distribution -->
          <div class="bg-card rounded-xl shadow-sm border border-border p-4 col-span-1">
            <h3 class="text-sm font-bold text-foreground mb-4">错误类型分布</h3>
            <div class="flex flex-col gap-3 mt-2">
              <div v-for="item in errorTypes" :key="item.type">
                <div class="flex items-center justify-between text-xs mb-1">
                  <span class="text-foreground">{{ item.type }}</span>
                  <span class="text-muted-foreground font-mono">{{ item.count }}项</span>
                </div>
                <div class="h-2.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all"
                    :class="item.color"
                    :style="{ width: `${(item.count / maxErrorCount) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Doctor QC Ranking -->
          <div class="bg-card rounded-xl shadow-sm border border-border p-4 col-span-1">
            <h3 class="text-sm font-bold text-foreground mb-4">医生质控排名</h3>
            <div class="flex flex-col gap-2">
              <div
                v-for="(doc, idx) in doctorRanking"
                :key="doc.name"
                class="flex items-center gap-3 px-3 py-2 rounded-lg"
                :class="idx === 0 ? 'bg-primary/5' : 'bg-secondary/30'"
              >
                <span
                  class="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                  :class="idx === 0 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'"
                >
                  {{ idx + 1 }}
                </span>
                <span class="flex-1 text-sm font-medium text-foreground">{{ doc.name }}</span>
                <span class="text-xs text-muted-foreground font-mono">{{ doc.passRate }}%</span>
                <div class="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div class="h-full rounded-full bg-medical-success" :style="{ width: `${doc.passRate}%` }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- QC Table -->
        <div class="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div class="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 class="text-sm font-bold text-foreground">质控列表</h3>
            <div class="flex items-center gap-2">
              <select
                v-model="timeFilter"
                class="px-3 py-1.5 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="today">今天</option>
                <option value="week">本周</option>
                <option value="month">本月</option>
              </select>
            </div>
          </div>

          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-secondary/30">
                  <th class="text-left text-xs font-semibold text-muted-foreground px-4 py-2.5">姓名</th>
                  <th class="text-left text-xs font-semibold text-muted-foreground px-4 py-2.5">性别</th>
                  <th class="text-left text-xs font-semibold text-muted-foreground px-4 py-2.5">检查部位</th>
                  <th class="text-left text-xs font-semibold text-muted-foreground px-4 py-2.5">质控类型</th>
                  <th class="text-left text-xs font-semibold text-muted-foreground px-4 py-2.5">详情</th>
                  <th class="text-left text-xs font-semibold text-muted-foreground px-4 py-2.5">时间</th>
                  <th class="text-left text-xs font-semibold text-muted-foreground px-4 py-2.5">状态</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                <tr
                  v-for="item in qcItems"
                  :key="item.id"
                  class="hover:bg-secondary/20 transition-colors"
                >
                  <td class="px-4 py-3 text-sm font-medium text-foreground">{{ item.patientName }}</td>
                  <td class="px-4 py-3 text-sm text-foreground">{{ item.gender }}</td>
                  <td class="px-4 py-3 text-sm text-foreground">{{ item.examPart }}</td>
                  <td class="px-4 py-3">
                    <span
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                      :class="getQcTypeClass(item.qcType)"
                    >
                      {{ item.qcType }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">{{ item.detail }}</td>
                  <td class="px-4 py-3 text-xs text-muted-foreground font-mono">{{ item.time }}</td>
                  <td class="px-4 py-3">
                    <span
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                      :class="getStatusClass(item.status)"
                    >
                      <span class="w-1.5 h-1.5 rounded-full" :class="getStatusDotClass(item.status)"></span>
                      {{ item.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="flex items-center justify-between px-4 py-3 border-t border-border">
            <span class="text-xs text-muted-foreground">共 {{ qcItems.length }} 条记录</span>
            <div class="flex items-center gap-1">
              <button class="px-3 py-1 rounded-md text-xs bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">上一页</button>
              <button class="px-3 py-1 rounded-md text-xs bg-primary text-primary-foreground">1</button>
              <button class="px-3 py-1 rounded-md text-xs bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">2</button>
              <button class="px-3 py-1 rounded-md text-xs bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">下一页</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import HeaderBar from '@/app/components/HeaderBar.vue'
import type { QualityControlItem } from '@/app/types'
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
} from 'lucide-vue-next'

const timeFilter = ref('today')

const statsCards = [
  { label: '今日报告数', value: 42, sub: '较昨日 +5', icon: FileText, iconBg: 'bg-primary/10', iconColor: 'text-primary' },
  { label: '质控通过数', value: 38, sub: '通过率 90.5%', icon: CheckCircle, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
  { label: '质控问题数', value: 4, sub: '需处理 2 项', icon: AlertCircle, iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
  { label: '待审核报告', value: 6, sub: '优先级高 1 项', icon: Clock, iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
]

const dailyData = [
  { day: '周一', value: 35 },
  { day: '周二', value: 42 },
  { day: '周三', value: 38 },
  { day: '周四', value: 45 },
  { day: '周五', value: 40 },
  { day: '周六', value: 28 },
  { day: '周日', value: 15 },
]

const maxDailyValue = computed(() => Math.max(...dailyData.map(d => d.value)))

const errorTypes = [
  { type: '历史报告冲突', count: 12, color: 'bg-amber-500' },
  { type: '逻辑矛盾', count: 8, color: 'bg-destructive' },
  { type: '完整性问题', count: 5, color: 'bg-primary' },
  { type: '格式错误', count: 3, color: 'bg-muted-foreground' },
]

const maxErrorCount = computed(() => Math.max(...errorTypes.map(e => e.count)))

const doctorRanking = [
  { name: '王医生', passRate: 98 },
  { name: '李医生', passRate: 95 },
  { name: '张医生', passRate: 92 },
  { name: '陈医生', passRate: 88 },
  { name: '刘医生', passRate: 85 },
]

const qcItems = ref<QualityControlItem[]>([
  { id: '1', patientName: '张伟', gender: '男', examPart: '甲状腺', qcType: '历史报告冲突', detail: '与2025-12-01检查结果存在明显差异，结节大小变化超过50%', time: '2026-03-06 09:15', status: '待审核' },
  { id: '2', patientName: '李芳', gender: '女', examPart: '乳腺', qcType: '完整性问题', detail: '报告缺少BI-RADS分类评估', time: '2026-03-06 09:30', status: '待审核' },
  { id: '3', patientName: '赵敏', gender: '女', examPart: '甲状腺', qcType: '逻辑矛盾', detail: '描述中提到"边界不清"，但诊断结论为良性', time: '2026-03-06 08:45', status: '已通过' },
  { id: '4', patientName: '刘娟', gender: '女', examPart: '乳腺', qcType: '历史报告冲突', detail: '前次诊断BI-RADS 3类，本次未做对比说明', time: '2026-03-06 08:20', status: '已驳回' },
  { id: '5', patientName: '陈刚', gender: '男', examPart: '颈动脉', qcType: '完整性问题', detail: '报告缺少双侧对比描述', time: '2026-03-06 10:00', status: '已通过' },
])

function getQcTypeClass(type: string) {
  switch (type) {
    case '历史报告冲突': return 'bg-amber-50 text-amber-700'
    case '逻辑矛盾': return 'bg-red-50 text-red-700'
    case '完整性问题': return 'bg-blue-50 text-blue-700'
    default: return 'bg-secondary text-secondary-foreground'
  }
}

function getStatusClass(status: string) {
  switch (status) {
    case '待审核': return 'bg-amber-50 text-amber-700'
    case '已通过': return 'bg-emerald-50 text-emerald-700'
    case '已驳回': return 'bg-red-50 text-red-700'
    default: return 'bg-secondary text-secondary-foreground'
  }
}

function getStatusDotClass(status: string) {
  switch (status) {
    case '待审核': return 'bg-amber-500'
    case '已通过': return 'bg-emerald-500'
    case '已驳回': return 'bg-red-500'
    default: return 'bg-muted-foreground'
  }
}
</script>
