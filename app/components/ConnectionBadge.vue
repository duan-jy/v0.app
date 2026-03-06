<template>
  <span
    class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium"
    :class="badgeClass"
  >
    <span class="w-1.5 h-1.5 rounded-full" :class="dotClass"></span>
    {{ status }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ConnectionStatus } from '@/app/types'

const props = defineProps<{
  status: ConnectionStatus
}>()

const badgeClass = computed(() => {
  switch (props.status) {
    case '已连接': return 'bg-emerald-50 text-emerald-700'
    case 'AI分析中': return 'bg-blue-50 text-blue-700'
    case '未连接': return 'bg-red-50 text-red-700'
    default: return 'bg-secondary text-secondary-foreground'
  }
})

const dotClass = computed(() => {
  switch (props.status) {
    case '已连接': return 'bg-emerald-500'
    case 'AI分析中': return 'bg-blue-500 animate-pulse'
    case '未连接': return 'bg-red-500'
    default: return 'bg-muted-foreground'
  }
})
</script>
