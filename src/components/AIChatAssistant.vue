<template>
  <div class="ai-assistant-card">
    <!-- AI 助手卡片头部 -->
    <div class="card-header">
      <div class="header-left">
        <i class="fas fa-robot"></i>
        <span>AI 智能助手</span>
      </div>
      <div class="status-badge">
        <i class="fas fa-circle"></i> 就绪
      </div>
    </div>

    <!-- AI 助手卡片内容 -->
    <div class="card-content">
      <!-- 快速指令按钮 -->
      <div class="quick-commands-grid">
        <div
          v-for="cmd in quickCommands"
          :key="cmd.id"
          class="command-btn"
          @click="executeCommand(cmd)"
          :title="cmd.tooltip"
        >
          <div class="cmd-icon">{{ cmd.icon }}</div>
          <div class="cmd-label">{{ cmd.label }}</div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="input-section">
        <div class="input-wrapper">
          <input
            v-model="inputText"
            type="text"
            placeholder="说出或输入指令..."
            class="text-input"
            @keyup.enter="sendCommand"
          />
          <button
            class="voice-btn"
            @click="toggleVoiceInput"
            :class="{ listening: isListening }"
            :title="isListening ? '停止录音' : '点击开始语音输入'"
          >
            <i class="fas fa-microphone"></i>
          </button>
        </div>
      </div>

      <!-- 最近指令历史 -->
      <div class="recent-commands" v-if="recentCommands.length > 0">
        <div class="recent-label">最近使用</div>
        <div class="recent-list">
          <span
            v-for="(cmd, idx) in recentCommands.slice(0, 3)"
            :key="idx"
            class="recent-tag"
            @click="inputText = cmd; sendCommand()"
          >
            {{ cmd }}
          </span>
        </div>
      </div>
    </div>

    <!-- AI 对话聊天窗口 -->
    <el-dialog
      v-model="chatVisible"
      title="🤖 AI 智能助手"
      width="500px"
      :close-on-click-modal="false"
      class="ai-chat-dialog"
      @close="resetChat"
    >
      <!-- 聊天消息区域 -->
      <div class="chat-messages" ref="messagesContainer">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="['message', msg.type]"
        >
          <div class="message-avatar">
            <i :class="msg.type === 'user' ? 'fas fa-user' : 'fas fa-robot'"></i>
          </div>
          <div class="message-content">
            <p>{{ msg.text }}</p>
            <span class="message-time">{{ msg.time }}</span>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
          <template #footer>
      <div class="chat-input-area">
        <el-input
          v-model="chatInputText"
          placeholder="输入指令或问题..."
          @keyup.enter="sendChatMessage"
          class="chat-input"
        />
        <div class="chat-actions">
          <el-button
            :type="isListening ? 'danger' : 'default'"
            icon="Microphone"
            circle
            @click="toggleVoiceInput"
            :loading="isListening"
            title="点击进行语音输入"
          />
          <el-button
            type="primary"
            icon="Send"
            circle
            @click="sendChatMessage"
            :loading="isProcessing"
            title="发送消息"
          />
          <!-- 添加跳转按钮 -->
          <el-button
            v-if="pendingRoute"
            type="success"
            @click="navigateToPendingRoute"
            title="跳转到相应页面"
          >
            前往 →
          </el-button>
        </div>
      </div>
    </template>

    </el-dialog>
  </div>
</template>

<script setup>
import { ref, nextTick } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";

const router = useRouter();

// 快速指令配置
const quickCommands = ref([
  {
    id: 1,
    icon: "📹",
    label: "监控",
    tooltip: "打开实时监控",
    command: "打开监控",
    route: "monitor",
  },
  {
    id: 2,
    icon: "🚨",
    label: "预警",
    tooltip: "查看预警信息",
    command: "查看预警",
    route: "warning",
  },
  {
    id: 3,
    icon: "📚",
    label: "知识",
    tooltip: "防疫知识库",
    command: "防疫知识",
    route: "knowledge",
  },
  {
    id: 4,
    icon: "📊",
    label: "分析",
    tooltip: "数据分析",
    command: "数据分析",
    route: "data",
  },
]);

// 聊天相关状态
const chatVisible = ref(false);
const messages = ref([
  {
    type: "assistant",
    text: "你好！👋 我是 AI 智能助手。我可以帮你快速导航到各个功能模块，或者回答一些关于畜禽防控的问题。",
    time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
  },
]);
const inputText = ref("");
const chatInputText = ref("");
const isProcessing = ref(false);
const isListening = ref(false);
const messagesContainer = ref(null);
const recentCommands = ref([]);
const pendingRoute = ref(null);

// 指令映射表
const commandMap = {
  打开监控: "monitor",
  查看预警: "warning",
  防疫知识: "knowledge",
  数据分析: "data",
  实时监控: "monitor",
  预警中心: "warning",
  知识库: "knowledge",
  分析: "data",
  监控: "monitor",
  预警: "warning",
  知识: "knowledge",
};

// 执行快速指令
const executeCommand = (cmd) => {
  inputText.value = cmd.command;
  processCommand(cmd.command, cmd.route);
  addToRecentCommands(cmd.command);
};

// 发送文字指令
const sendCommand = () => {
  if (!inputText.value.trim()) {
    ElMessage.warning("请输入指令");
    return;
  }
  const command = inputText.value.trim();
  inputText.value = "";
  processCommand(command);
  addToRecentCommands(command);
};

// 处理指令
const processCommand = async (command, route = null) => {
  // 打开聊天窗口
  chatVisible.value = true;
  nextTick(() => {
    scrollToBottom();
  });

  // 添加用户消息
  messages.value.push({
    type: "user",
    text: command,
    time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
  });

  scrollToBottom();

  // 处理指令
  isProcessing.value = true;
  await new Promise((resolve) => setTimeout(resolve, 500));

  let response = "";
  let targetRoute = route;

  // 如果没有指定路由，尝试从命令映射中查找
  if (!targetRoute) {
    for (const [key, value] of Object.entries(commandMap)) {
      if (command.includes(key)) {
        response = `正在为您打开${key}...`;
        targetRoute = value;
        break;
      }
    }
  } else {
    response = `正在为您打开...`;
  }

  // 如果没有匹配的指令，返回默认响应
  if (!response) {
    response = `我理解您想要：${command}。\n\n我目前支持以下指令：\n• 打开监控 / 实时监控\n• 查看预警 / 预警中心\n• 防疫知识 / 知识库\n• 数据分析 / 分析\n\n您可以尝试这些指令，或者告诉我您需要什么帮助。`;
  }

  // 添加助手响应
  messages.value.push({
    type: "assistant",
    text: response,
    time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
  });

  scrollToBottom();
  isProcessing.value = false;

  // 保存待跳转的路由，但不自动跳转
  if (targetRoute) {
    pendingRoute.value = targetRoute;
  }
};


// 发送聊天消息
const sendChatMessage = async () => {
  if (!chatInputText.value.trim()) {
    ElMessage.warning("请输入内容");
    return;
  }

  const command = chatInputText.value.trim();
  chatInputText.value = "";
  await processCommand(command);
};

// 滚动到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

// 添加到最近使用
const addToRecentCommands = (cmd) => {
  if (!recentCommands.value.includes(cmd)) {
    recentCommands.value.unshift(cmd);
    if (recentCommands.value.length > 5) {
      recentCommands.value.pop();
    }
  }
};

// 重置聊天
const resetChat = () => {
  messages.value = [
    {
      type: "assistant",
      text: "你好！👋 我是 AI 智能助手。我可以帮你快速导航到各个功能模块，或者回答一些关于畜禽防控的问题。",
      time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
    },
  ];
};

// 语音输入
const toggleVoiceInput = () => {
  const SpeechRecognition =
    window.webkitSpeechRecognition || window.SpeechRecognition;

  if (!SpeechRecognition) {
    ElMessage.error("您的浏览器不支持语音识别");
    return;
  }

  if (isListening.value) {
    isListening.value = false;
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "zh-CN";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    isListening.value = true;
    ElMessage.info("正在监听，请说话...");
  };

  recognition.onresult = (event) => {
    let transcript = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    if (transcript) {
      inputText.value = transcript;
      chatInputText.value = transcript;
      ElMessage.success("已识别：" + transcript);
    }
  };

  recognition.onerror = (event) => {
    ElMessage.error("语音识别出错：" + event.error);
  };

  recognition.onend = () => {
    isListening.value = false;
  };

  recognition.start();
};
// 跳转到待定路由
const navigateToPendingRoute = async () => {
  if (pendingRoute.value) {
    const route = pendingRoute.value;
    chatVisible.value = false;
    pendingRoute.value = null;
    await new Promise((resolve) => setTimeout(resolve, 300));
    await router.push({ path: `/${route}` });
    ElMessage.success(`已为您打开相应页面`);
  }
};

</script>

<style scoped>
.ai-assistant-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
  color: white;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
}

.header-left i {
  font-size: 20px;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 12px;
}

.status-badge i {
  color: #4caf50;
  font-size: 8px;
}

.card-content {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quick-commands-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.command-btn {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.command-btn:hover {
  background: #9c27b0;
  color: white;
  border-color: #9c27b0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(156, 39, 176, 0.2);
}

.cmd-icon {
  font-size: 24px;
}

.cmd-label {
  font-size: 12px;
  font-weight: 600;
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
}

.text-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 12px;
  font-family: inherit;
  transition: all 0.3s ease;
}

.text-input:focus {
  outline: none;
  border-color: #9c27b0;
  box-shadow: 0 0 0 2px rgba(156, 39, 176, 0.1);
}

.voice-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #9c27b0;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 14px;
}

.voice-btn:hover {
  background: #7b1fa2;
  transform: scale(1.05);
}

.voice-btn.listening {
  background: #f44336;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(244, 67, 54, 0);
  }
}

.recent-commands {
  border-top: 1px solid #f0f0f0;
  padding-top: 8px;
}

.recent-label {
  font-size: 11px;
  color: #999;
  font-weight: 600;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.recent-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.recent-tag {
  display: inline-block;
  background: #f0f0f0;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
}

.recent-tag:hover {
  background: #9c27b0;
  color: white;
  border-color: #9c27b0;
}

/* 聊天对话框样式 */
:deep(.ai-chat-dialog .el-dialog__body) {
  padding: 16px;
  height: 400px;
  display: flex;
  flex-direction: column;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 16px;
  padding-right: 8px;
}

.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.message {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.message.assistant .message-avatar {
  background: #e8f5e9;
  color: #2e7d32;
}

.message.user .message-avatar {
  background: #e3f2fd;
  color: #1976d2;
}

.message-content {
  max-width: 70%;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-content p {
  margin: 0;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
  white-space: pre-wrap;
}

.message.assistant .message-content p {
  background: #f5f5f5;
  color: #333;
}

.message.user .message-content p {
  background: #9c27b0;
  color: white;
}

.message-time {
  font-size: 12px;
  color: #999;
  padding: 0 12px;
}

.chat-input-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-input {
  flex: 1;
}

.chat-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.chat-actions :deep(.el-button) {
  padding: 8px;
}

@media (max-width: 768px) {
  .quick-commands-grid {
    grid-template-columns: 1fr;
  }

  :deep(.ai-chat-dialog) {
    width: 90% !important;
  }

  .message-content {
    max-width: 85%;
  }
}
</style>
