<template>
  <AppHeader />
  <main class="app-main">
    <router-view />
  </main>
  <AppFooter />
</template>

<script setup>
import AppHeader from "./components/AppHeader.vue";
import AppFooter from "./components/AppFooter.vue";
</script>

<style scoped>
.app-main {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f5f7fa;
}
</style>
