<template>
  <div class="app-layout">
    <AppHeader />
    <div class="app-body">
      <aside class="app-sidebar">
        <el-menu
          class="sidebar-menu"
          :default-active="activeIndex"
          background-color="#ffffff"
          text-color="#606266"
          active-text-color="#409eff"
          unique-opened
          @select="$emit('select', $event)"
        >
          <el-menu-item index="dashboard">首页</el-menu-item>
          <el-menu-item index="monitor">实时监控</el-menu-item>
          <el-menu-item index="ai-sentinel">AI哨兵</el-menu-item>
          <el-menu-item index="warning">预警中心</el-menu-item>
          <el-menu-item index="knowledge">防疫知识</el-menu-item>
          <el-menu-item index="ranch">养殖场管理</el-menu-item>
          <el-menu-item index="profile">个人中心</el-menu-item>
        </el-menu>
      </aside>
      <main class="app-main">
        <slot />
      </main>
    </div>
    <AppFooter />
  </div>
</template>

<script setup>
import AppHeader from "./components/AppHeader.vue";
import AppFooter from "./components/AppFooter.vue";

const props = defineProps({
  activeIndex: {
    type: String,
    default: "dashboard",
  },
});
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.app-body {
  flex: 1;
  display: flex;
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  background-color: var(--background-color);
}
.app-sidebar {
  width: 220px;
  min-width: 220px;
  background: #ffffff;
  border-right: 1px solid #eaeaea;
  padding: 16px 14px;
  box-shadow: inset -1px 0 0 rgba(0, 0, 0, 0.04);
}
.app-sidebar h3 {
  margin: 0 0 12px;
  color: var(--primary-dark);
  font-size: 16px;
  font-weight: 600;
}
.sidebar-menu {
  border-right: none;
}
.app-main {
  flex: 1;
  min-height: calc(100vh - 130px);
  padding: 18px;
  background-color: var(--background-color);
}
</style>
