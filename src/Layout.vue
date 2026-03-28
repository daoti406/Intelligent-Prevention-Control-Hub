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
          <el-menu-item index="ai-sentinel">智栏卫士</el-menu-item>
          <el-menu-item index="warning">预警中心</el-menu-item>
          <el-menu-item index="knowledge">防疫知识</el-menu-item>
          <el-menu-item index="ranch">养殖场管理</el-menu-item>
          <el-menu-item index="profile">个人中心</el-menu-item>
          <el-menu-item index="notifications" class="notifications-menu-item">
            <div class="sidebar-notice-item">
              <span>通知中心</span>
              <span v-if="unreadNotifications" class="sidebar-notice-meta">
                未读{{ unreadNotifications }}条
              </span>
            </div>
          </el-menu-item>
        </el-menu>

        <div class="care-mode-panel">
          <div class="care-mode-copy">
            <div class="care-mode-title">关怀版模式</div>
            <div class="care-mode-desc">开启后放大文字和常用控件</div>
          </div>
          <el-switch
            :model-value="isCareMode"
            @change="$emit('toggle-care-mode')"
            inline-prompt
            active-text="开"
            inactive-text="关"
          />
        </div>
      </aside>
      <main class="app-main">
        <div class="app-main-content">
          <slot />
          <AppFooter />
        </div>
      </main>
    </div>
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
  unreadNotifications: {
    type: Number,
    default: 0,
  },
  isCareMode: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.app-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.app-body {
  flex: 1;
  min-height: 0;
  display: flex;
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  background-color: var(--background-color);
  overflow: hidden;
}
.app-sidebar {
  width: 220px;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
  background: #ffffff;
  border-right: 1px solid #eaeaea;
  padding: 16px 14px;
  box-shadow: inset -1px 0 0 rgba(0, 0, 0, 0.04);
  scrollbar-width: thin;
  scrollbar-color: #7fcf91 #eef7ef;
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

.sidebar-notice-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.sidebar-notice-meta {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  background: #f56c6c;
  padding: 1px 6px;
  border-radius: 999px;
  color: #fff;
  font-size: 10px;
  line-height: 1.4;
  text-align: center;
  font-weight: 600;
  white-space: nowrap;
}

.care-mode-panel {
  margin-top: 12px;
  padding: 12px;
  border-radius: 14px;
  background: linear-gradient(180deg, #f7fbf7 0%, #eef7ef 100%);
  border: 1px solid #d7e7d9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.care-mode-copy {
  min-width: 0;
}

.care-mode-title {
  font-size: 13px;
  font-weight: 600;
  color: #1d3b27;
  margin-bottom: 4px;
}

.care-mode-desc {
  font-size: 11px;
  color: #718277;
  line-height: 1.4;
}

.app-main {
  flex: 1;
  min-height: 0;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
  padding: 18px;
  background-color: var(--background-color);
}

.app-main-content {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.app-sidebar::-webkit-scrollbar {
  width: 8px;
}

.app-sidebar::-webkit-scrollbar-track {
  background: #eef7ef;
  border-radius: 999px;
}

.app-sidebar::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #98d8a5 0%, #52c41a 100%);
  border-radius: 999px;
}

.app-sidebar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #7fcf91 0%, #2e7d32 100%);
}
</style>
