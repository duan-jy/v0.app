<template>
  <div class="flex flex-col h-screen bg-background overflow-hidden">
    <!-- Top Header Bar -->
    <HeaderBar />

    <!-- Main Content: 3-column layout -->
    <div class="flex flex-1 gap-3 p-3 overflow-hidden">
      <!-- Left Panel: Patient Queue + Voice -->
      <aside class="flex flex-col gap-3 w-72 shrink-0">
        <div class="flex-1 min-h-0">
          <PatientQueue />
        </div>
        <VoiceRecognition />
      </aside>

      <!-- Center: Ultrasound Video -->
      <main class="flex-1 min-w-0">
        <UltrasoundVideoViewer />
      </main>

      <!-- Right Panel: AI Analysis -->
      <aside class="w-80 shrink-0 overflow-hidden">
        <AIAnalysisPanel />
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import HeaderBar from '@/app/components/HeaderBar.vue'
import PatientQueue from '@/app/components/PatientQueue.vue'
import VoiceRecognition from '@/app/components/VoiceRecognition.vue'
import UltrasoundVideoViewer from '@/app/components/UltrasoundVideoViewer.vue'
import AIAnalysisPanel from '@/app/components/AIAnalysisPanel.vue'
</script>
