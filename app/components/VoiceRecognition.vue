<template>
  <div class="bg-panel-bg rounded-xl shadow-sm border border-border overflow-hidden">
    <div class="flex items-center justify-between px-4 py-3 border-b border-border">
      <h2 class="text-sm font-bold text-foreground">语音输入</h2>
      <span
        v-if="store.isRecording"
        class="flex items-center gap-1 text-xs text-red-600 font-medium"
      >
        <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
        录音中
      </span>
    </div>

    <div class="px-4 py-3">
      <!-- Mic Button -->
      <div class="flex flex-col items-center gap-3">
        <button
          class="flex items-center justify-center w-14 h-14 rounded-full transition-all"
          :class="store.isRecording
            ? 'bg-red-500 text-white shadow-lg shadow-red-200 scale-110'
            : 'bg-primary/10 text-primary hover:bg-primary/20'"
          @click="store.toggleRecording()"
          :aria-label="store.isRecording ? '停止录音' : '开始录音'"
        >
          <Mic v-if="!store.isRecording" class="w-6 h-6" />
          <MicOff v-else class="w-6 h-6" />
        </button>
        <span class="text-xs text-muted-foreground">
          {{ store.isRecording ? '点击停止语音输入' : '点击开始语音输入' }}
        </span>
      </div>

      <!-- Voice Text Output -->
      <div
        v-if="store.voiceText || store.isRecording"
        class="mt-3 p-3 rounded-lg bg-secondary/50 border border-border text-sm text-foreground min-h-[60px]"
      >
        <p v-if="store.voiceText">{{ store.voiceText }}</p>
        <p v-else class="text-muted-foreground animate-pulse">等待语音输入...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWorkstationStore } from '@/app/stores/workstation'
import { Mic, MicOff } from 'lucide-vue-next'

const store = useWorkstationStore()
</script>
