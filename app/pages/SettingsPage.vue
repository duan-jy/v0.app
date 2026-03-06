<template>
  <div class="flex flex-col h-screen bg-background overflow-hidden">
    <HeaderBar />

    <div class="flex-1 overflow-y-auto p-6">
      <div class="max-w-2xl mx-auto">
        <!-- Page Title -->
        <div class="flex items-center gap-3 mb-6">
          <RouterLink
            to="/"
            class="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft class="w-4 h-4 text-foreground" />
          </RouterLink>
          <div>
            <h1 class="text-xl font-bold text-foreground">系统配置</h1>
            <p class="text-sm text-muted-foreground">超声工作站连接与AI参数设置</p>
          </div>
        </div>

        <!-- Settings Form -->
        <div class="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <!-- Server Section -->
          <div class="px-6 py-4 border-b border-border">
            <h3 class="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <Server class="w-4 h-4 text-primary" />
              服务器设置
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-xs text-muted-foreground">服务器地址</label>
                <input
                  v-model="localConfig.serverAddress"
                  class="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="例: 192.168.1.100"
                />
              </div>
              <div>
                <label class="text-xs text-muted-foreground">服务器端口</label>
                <input
                  v-model.number="localConfig.serverPort"
                  type="number"
                  class="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="例: 8080"
                />
              </div>
              <div class="col-span-2">
                <label class="text-xs text-muted-foreground">设备ID</label>
                <input
                  v-model="localConfig.deviceId"
                  class="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="例: US-STATION-001"
                />
              </div>
            </div>
          </div>

          <!-- TURN Server Section -->
          <div class="px-6 py-4 border-b border-border">
            <h3 class="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <Radio class="w-4 h-4 text-primary" />
              TURN服务器设置
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="col-span-2">
                <label class="text-xs text-muted-foreground">TURN服务器地址</label>
                <input
                  v-model="localConfig.turnServerAddress"
                  class="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="例: turn.hospital.local"
                />
              </div>
              <div>
                <label class="text-xs text-muted-foreground">TURN账号</label>
                <input
                  v-model="localConfig.turnUsername"
                  class="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="请输入账号"
                />
              </div>
              <div>
                <label class="text-xs text-muted-foreground">TURN密码</label>
                <input
                  v-model="localConfig.turnPassword"
                  type="password"
                  class="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="请输入密码"
                />
              </div>
            </div>
          </div>

          <!-- AI Settings -->
          <div class="px-6 py-4 border-b border-border">
            <h3 class="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <BrainCircuit class="w-4 h-4 text-primary" />
              AI参数设置
            </h3>
            <div>
              <label class="text-xs text-muted-foreground">AI置信度阈值</label>
              <div class="flex items-center gap-4 mt-2">
                <input
                  v-model.number="localConfig.aiConfidenceThreshold"
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  class="flex-1 h-2 rounded-full appearance-none bg-secondary cursor-pointer accent-primary"
                />
                <span class="text-sm font-mono font-bold text-foreground w-14 text-right">
                  {{ (localConfig.aiConfidenceThreshold * 100).toFixed(0) }}%
                </span>
              </div>
              <p class="text-xs text-muted-foreground mt-2">
                低于此阈值的AI检测结果将不会显示。建议值: 70%-85%
              </p>
            </div>
          </div>

          <!-- Connection Status -->
          <div class="px-6 py-4 border-b border-border">
            <h3 class="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <Wifi class="w-4 h-4 text-primary" />
              连接状态
            </h3>
            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/30">
                <span class="text-sm text-foreground">AI分析服务器</span>
                <span class="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                  已连接
                </span>
              </div>
              <div class="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/30">
                <span class="text-sm text-foreground">TURN中继服务器</span>
                <span class="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                  已连接
                </span>
              </div>
              <div class="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/30">
                <span class="text-sm text-foreground">超声采集卡</span>
                <span class="flex items-center gap-1.5 text-xs font-medium text-amber-600">
                  <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                  模拟模式
                </span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-3 px-6 py-4">
            <RouterLink
              to="/"
              class="px-5 py-2 rounded-lg text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              取消
            </RouterLink>
            <button
              class="px-5 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              @click="saveConfig"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useWorkstationStore } from '@/app/stores/workstation'
import HeaderBar from '@/app/components/HeaderBar.vue'
import type { SystemConfig } from '@/app/types'
import {
  ArrowLeft,
  Server,
  Radio,
  BrainCircuit,
  Wifi,
} from 'lucide-vue-next'

const store = useWorkstationStore()
const router = useRouter()

const localConfig = reactive<SystemConfig>({ ...store.config })

function saveConfig() {
  store.updateConfig({ ...localConfig })
  router.push('/')
}
</script>
