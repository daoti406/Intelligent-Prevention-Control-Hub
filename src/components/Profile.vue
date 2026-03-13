<template>
  <div class="profile-container">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="user-card" shadow="hover">
          <div class="user-avatar-section">
            <el-avatar :size="100" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
            <h2 class="username">{{ username }}</h2>
            <p class="role">系统管理员</p>
          </div>
          <el-divider></el-divider>
          <div class="user-stats">
            <div class="stat-box">
              <span class="stat-num">128</span>
              <span class="stat-label">登录次数</span>
            </div>
            <div class="stat-box">
              <span class="stat-num">45</span>
              <span class="stat-label">处理预警</span>
            </div>
            <div class="stat-box">
              <span class="stat-num">12</span>
              <span class="stat-label">管理设备</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="16">
        <el-card class="settings-card" shadow="hover">
          <template #header>
            <div class="flex justify-between items-center">
              <span>基本信息设置</span>
              <el-button type="primary" size="small">保存修改</el-button>
            </div>
          </template>
          <el-form :model="userForm" label-width="100px">
            <el-form-item label="用户姓名">
              <el-input v-model="userForm.name" />
            </el-form-item>
            <el-form-item label="联系电话">
              <el-input v-model="userForm.phone" />
            </el-form-item>
            <el-form-item label="电子邮箱">
              <el-input v-model="userForm.email" />
            </el-form-item>
            <el-form-item label="所属区域">
              <el-select v-model="userForm.region" placeholder="请选择区域" style="width: 100%;">
                <el-option label="华东养殖中心" value="east" />
                <el-option label="华南养殖中心" value="south" />
                <el-option label="华北养殖中心" value="north" />
              </el-select>
            </el-form-item>
            <el-form-item label="通知偏好">
              <el-checkbox-group v-model="userForm.notifications">
                <el-checkbox label="短信通知" />
                <el-checkbox label="邮件通知" />
                <el-checkbox label="APP推送" />
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="个性签名">
              <el-input type="textarea" v-model="userForm.bio" :rows="3" />
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { inject, reactive } from 'vue';
const username = inject('username');

const userForm = reactive({
  name: '管理员',
  phone: '138****8888',
  email: 'admin@sentinel.com',
  region: 'east',
  notifications: ['短信通知', 'APP推送'],
  bio: '专注畜禽健康智能监控，致力于提升养殖效率与生物安全。'
});
</script>

<style scoped>
.profile-container {
  padding: 0;
}
.user-card {
  text-align: center;
  height: 100%;
}
.user-avatar-section {
  padding: 20px 0;
}
.username {
  margin: 15px 0 5px;
  color: #303133;
}
.role {
  color: #909399;
  font-size: 14px;
}
.user-stats {
  display: flex;
  justify-content: space-around;
  padding: 10px 0;
}
.stat-box {
  display: flex;
  flex-direction: column;
}
.stat-num {
  font-size: 20px;
  font-weight: bold;
  color: #2e7d32;
}
.stat-label {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
.settings-card {
  height: 100%;
}
</style>
