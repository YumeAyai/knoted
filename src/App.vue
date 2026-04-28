<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import Toolbar from '@/components/Toolbar/Toolbar.vue'
import Sidebar from '@/components/Sidebar/Sidebar.vue'
import EditorPanel from '@/components/Editor/EditorPanel.vue'
import StatusBar from '@/components/StatusBar/StatusBar.vue'

const store = useAppStore()

// Apply theme on mount
onMounted(() => {
  document.documentElement.setAttribute('data-theme', store.theme)
})

// Watch theme changes
watch(() => store.theme, (newTheme) => {
  document.documentElement.setAttribute('data-theme', newTheme)
})
</script>

<template>
  <div class="app">
    <Toolbar />
    <div class="app-body">
      <Sidebar />
      <main class="app-main">
        <EditorPanel />
      </main>
    </div>
    <StatusBar />
  </div>
</template>

<style>
@import '@/styles/variables.css';

.app {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-background);
}

.app-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>