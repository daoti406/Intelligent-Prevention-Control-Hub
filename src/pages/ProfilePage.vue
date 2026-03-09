<template>
  <div class="profile-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>👤 个人中心</h2>
      <p>管理您的账户信息和系统设置</p>
    </div>

    <!-- 个人信息卡片 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="section-header">
              <i class="fas fa-user-circle"></i>
              <span>个人信息</span>
            </div>
          </template>
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="avatar-section">
                <el-avatar
                  :size="120"
                  src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
                />
                <el-button type="primary" size="small" @click="handleUploadAvatar" style="margin-top: 12px">
                  <i class="fas fa-upload"></i> 更换头像
                </el-button>
              </div>
            </el-col>
            <el-col :span="16">
              <el-form :model="userInfo" label-width="100px">
                <el-form-item label="用户名">
                  <el-input v-model="userInfo.username" disabled />
                </el-form-item>
                <el-form-item label="真实姓名">
                  <el-input v-model="userInfo.realName" />
                </el-form-item>
                <el-form-item label="邮箱">
                  <el-input v-model="userInfo.email" />
                </el-form-item>
                <el-form-item label="电话">
                  <el-input v-model="userInfo.phone" />
                </el-form-item>
                <el-form-item label="角色">
                  <el-input v-model="userInfo.role" disabled />
                </el-form-item>
                <el-form-item label="加入时间">
                  <el-input v-model="userInfo.joinDate" disabled />
                </el-form-item>
                <el-button type="primary" @click="saveUserInfo">
                  <i class="fas fa-save"></i> 保存修改
                </el-button>
              </el-form>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <!-- 安全设置 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="section-header">
              <i class="fas fa-lock"></i>
              <span>密码管理</span>
            </div>
          </template>
          <el-form :model="passwordForm" label-width="100px">
            <el-form-item label="当前密码">
              <el-input v-model="passwordForm.oldPassword" type="password" show-password />
            </el-form-item>
            <el-form-item label="新密码">
              <el-input v-model="passwordForm.newPassword" type="password" show-password />
            </el-form-item>
            <el-form-item label="确认密码">
              <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
            </el-form-item>
            <el-button type="primary" @click="changePassword">
              <i class="fas fa-key"></i> 修改密码
            </el-button>
          </el-form>
        </el-card>
      </el-col>

      <!-- 登录记录 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="section-header">
              <i class="fas fa-history"></i>
              <span>登录记录</span>
            </div>
          </template>
          <div class="login-history">
            <div v-for="(log, index) in loginLogs" :key="index" class="log-item">
              <div class="log-info">
                <div class="log-device">{{ log.device }}</div>
                <div class="log-location">{{ log.location }}</div>
              </div>
              <div class="log-time">{{ log.time }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 系统设置 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="section-header">
              <i class="fas fa-cog"></i>
              <span>系统设置</span>
            </div>
          </template>
          <el-form :model="systemSettings" label-width="150px">
            <el-form-item label="邮件通知">
              <el-switch v-model="systemSettings.emailNotification" />
              <span class="setting-desc">接收系统邮件通知</span>
            </el-form-item>
            <el-form-item label="短信告警">
              <el-switch v-model="systemSettings.smsAlert" />
              <span class="setting-desc">接收紧急情况短信告警</span>
            </el-form-item>
            <el-form-item label="数据导出权限">
              <el-switch v-model="systemSettings.dataExport" />
              <span class="setting-desc">允许导出系统数据</span>
            </el-form-item>
            <el-form-item label="API 访问">
              <el-switch v-model="systemSettings.apiAccess" />
              <span class="setting-desc">允许第三方应用通过 API 访问</span>
            </el-form-item>
            <el-button type="primary" @click="saveSystemSettings">
              <i class="fas fa-save"></i> 保存设置
            </el-button>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <!-- 账户操作 -->
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="section-header">
              <i class="fas fa-exclamation-triangle"></i>
              <span>账户操作</span>
            </div>
          </template>
          <div class="account-actions">
            <div class="action-item">
              <div class="action-info">
                <h4>导出个人数据</h4>
                <p>下载您在系统中的所有个人数据</p>
              </div>
              <el-button @click="exportData">
                <i class="fas fa-download"></i> 导出
              </el-button>
            </div>
            <div class="action-item">
              <div class="action-info">
                <h4>注销账户</h4>
                <p>永久删除您的账户和所有相关数据</p>
              </div>
              <el-button type="danger" @click="deleteAccount">
                <i class="fas fa-trash"></i> 注销
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

const userInfo = ref({
  username: "admin",
  realName: "管理员",
  email: "admin@example.com",
  phone: "13800138000",
  role: "系统管理员",
  joinDate: "2025-01-01",
});

const passwordForm = ref({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const systemSettings = ref({
  emailNotification: true,
  smsAlert: true,
  dataExport: true,
  apiAccess: false,
});

const loginLogs = ref([
  {
    device: "Windows 10 - Chrome",
    location: "北京市 - 电信",
    time: "2026-03-09 15:30:22",
  },
  {
    device: "iPhone 12 - Safari",
    location: "北京市 - 移动",
    time: "2026-03-09 09:15:10",
  },
  {
    device: "MacBook Pro - Chrome",
    location: "上海市 - 联通",
    time: "2026-03-08 20:45:33",
  },
  {
    device: "Windows 10 - Edge",
    location: "深圳市 - 电信",
    time: "2026-03-08 14:20:15",
  },
]);

const handleUploadAvatar = () => {
  ElMessage.info("头像上传功能开发中");
};

const saveUserInfo = () => {
  ElMessage.success("个人信息已保存");
};

const changePassword = () => {
  if (!passwordForm.value.oldPassword) {
    ElMessage.error("请输入当前密码");
    return;
  }
  if (!passwordForm.value.newPassword) {
    ElMessage.error("请输入新密码");
    return;
  }
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    ElMessage.error("两次输入的密码不一致");
    return;
  }
  ElMessageBox.confirm("确定要修改密码吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      ElMessage.success("密码已修改");
      passwordForm.value = {
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      };
    })
    .catch(() => {});
};

const saveSystemSettings = () => {
  ElMessage.success("系统设置已保存");
};

const exportData = () => {
  ElMessage.success("数据导出成功，已下载到本地");
};

const deleteAccount = () => {
  ElMessageBox.confirm("注销账户是不可逆的操作，您确定要继续吗？", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      ElMessage.success("账户已注销");
    })
    .catch(() => {});
};
</script>

<style scoped>
.profile-container {
  width: 100%;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  color: #333;
}

.page-header p {
  margin: 0;
  font-size: 14px;
  color: #999;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.section-header i {
  color: #2e7d32;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  text-align: center;
}

.setting-desc {
  margin-left: 12px;
  font-size: 12px;
  color: #999;
}

.login-history {
  max-height: 300px;
  overflow-y: auto;
}

.log-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.log-item:hover {
  background-color: #fafafa;
}

.log-info {
  flex: 1;
}

.log-device {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.log-location {
  font-size: 12px;
  color: #999;
}

.log-time {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  margin-left: 12px;
}

.account-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.action-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 4px;
  border-left: 3px solid #ff9800;
}

.action-info h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.action-info p {
  margin: 0;
  font-size: 12px;
  color: #999;
}

@media (max-width: 768px) {
  .page-header h2 {
    font-size: 18px;
  }

  .action-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
