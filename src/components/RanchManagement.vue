<template>
  <div class="ranch-management">
    <el-card shadow="hover">
      <div class="ranch-header">
        <div class="ranch-title">养殖场管理</div>
        <div class="ranch-ops">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索名称/地址/类型/状态"
            size="small"
            clearable
            @keyup.enter="handleSearch"
            style="width: 240px"
          />
          <el-select
            v-model="searchForm.type"
            placeholder="类型"
            size="small"
            clearable
            style="width: 120px"
          >
            <el-option label="猪舍" value="猪舍" />
            <el-option label="鸡舍" value="鸡舍" />
            <el-option label="牛舍" value="牛舍" />
          </el-select>
          <el-select
            v-model="searchForm.status"
            placeholder="状态"
            size="small"
            clearable
            style="width: 120px"
          >
            <el-option label="运营" value="运营" />
            <el-option label="停用" value="停用" />
          </el-select>
          <el-button type="primary" size="small" @click="handleSearch">搜索</el-button>
          <el-button size="small" @click="resetSearch">重置</el-button>
          <el-button type="success" size="small" @click="openForm()">新增养殖场</el-button>
        </div>
      </div>

      <div class="ranch-summary">
        <span>共 {{ ranches.length }} 个养殖场</span>
        <span>当前显示 {{ filteredRanches.length }} 条</span>
      </div>

      <el-table
        :data="filteredRanches"
        border
        style="width: 100%"
        empty-text="暂无符合条件的养殖场"
      >
        <el-table-column prop="name" label="养殖场名称" width="200" />
        <el-table-column prop="address" label="地址" />
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '运营' ? 'success' : 'warning'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="290">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="openForm(row)">编辑</el-button>
            <el-button type="success" size="small" @click="openDeviceManager(row)">设备管理</el-button>
            <el-button type="danger" size="small" @click="removeRanch(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div style="margin-top: 16px">
        <el-tabs v-model="currentTab" type="border-card">
          <el-tab-pane label="饲喂记录" name="feed">
            <el-table :data="feedRecords" border>
              <el-table-column prop="time" label="时间" width="180" />
              <el-table-column prop="farm" label="养殖场" width="180" />
              <el-table-column prop="animal" label="畜禽类型" width="120" />
              <el-table-column prop="quantity" label="饲料量(kg)" width="120" />
              <el-table-column prop="person" label="负责人" width="120" />
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="畜禽档案" name="animal">
            <el-table :data="animalRecords" border>
              <el-table-column prop="id" label="档案 ID" width="120" />
              <el-table-column prop="name" label="名称" width="160" />
              <el-table-column prop="species" label="品种" width="120" />
              <el-table-column prop="age" label="年龄" width="100" />
              <el-table-column prop="health" label="健康状态" width="120" />
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>

    <el-dialog :title="dialogTitle" v-model="formVisible" width="500px" :destroy-on-close="true">
      <el-form :model="form" :rules="formRules" ref="ranchFormRef" label-width="100px" @submit.prevent>
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择类型">
            <el-option label="猪舍" value="猪舍" />
            <el-option label="鸡舍" value="鸡舍" />
            <el-option label="牛舍" value="牛舍" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option label="运营" value="运营" />
            <el-option label="停用" value="停用" />
          </el-select>
          </el-form-item>
        </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="formVisible = false">取 消</el-button>
          <el-button type="primary" :loading="saveLoading" @click="saveForm">确 认</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog :title="deviceDialogTitle" v-model="deviceFormVisible" width="520px" :destroy-on-close="true">
      <el-form :model="deviceForm" :rules="deviceRules" ref="deviceFormRef" label-width="100px" @submit.prevent>
        <el-form-item label="设备名称" prop="name">
          <el-input v-model="deviceForm.name" />
        </el-form-item>
        <el-form-item label="设备类型" prop="type">
          <el-select v-model="deviceForm.type" placeholder="请选择类型">
            <el-option label="传感器" value="传感器" />
            <el-option label="摄像机" value="摄像机" />
            <el-option label="控制器" value="控制器" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备状态" prop="status">
          <el-select v-model="deviceForm.status" placeholder="请选择状态">
            <el-option label="在线" value="在线" />
            <el-option label="离线" value="离线" />
            <el-option label="维护中" value="维护中" />
          </el-select>
        </el-form-item>
        <el-form-item label="安装位置" prop="location">
          <el-input v-model="deviceForm.location" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="deviceFormVisible = false">取 消</el-button>
          <el-button type="primary" :loading="deviceSaveLoading" @click="saveDeviceForm">确 认</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      v-model="deviceManagerVisible"
      width="980px"
      :destroy-on-close="true"
      :title="currentRanch ? `${currentRanch.name} - 设备管理` : '设备管理'"
    >
      <div class="device-toolbar">
        <el-input
          v-model="deviceSearch.keyword"
          placeholder="搜索设备编号/名称/类型/位置"
          size="small"
          clearable
          style="width: 260px"
        />
        <el-select
          v-model="deviceSearch.status"
          placeholder="设备状态"
          size="small"
          clearable
          style="width: 130px"
        >
          <el-option label="在线" value="在线" />
          <el-option label="离线" value="离线" />
          <el-option label="维护中" value="维护中" />
        </el-select>
        <el-button type="primary" size="small" @click="handleDeviceSearch">搜索</el-button>
        <el-button size="small" @click="resetDeviceSearch">重置</el-button>
        <el-button type="success" size="small" @click="openDeviceForm()">新增设备</el-button>
      </div>

      <div class="device-summary">
        <span>当前养殖场设备 {{ ranchDeviceCount }} 台</span>
        <span>筛选结果 {{ filteredDevices.length }} 台</span>
      </div>

      <el-table :data="filteredDevices" border empty-text="暂无符合条件的设备">
        <el-table-column prop="id" label="设备 ID" width="130" />
        <el-table-column prop="name" label="设备名称" width="180" />
        <el-table-column prop="type" label="类型" width="150" />
        <el-table-column label="状态" width="140">
          <template #default="{ row }">
            <el-select
              v-model="row.status"
              size="small"
              @change="handleDeviceStatusChange(row)"
            >
              <el-option label="在线" value="在线" />
              <el-option label="离线" value="离线" />
              <el-option label="维护中" value="维护中" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="位置" />
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="openDeviceForm(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="removeDevice(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

const currentTab = ref("feed");
const formVisible = ref(false);
const ranchFormRef = ref(null);
const saveLoading = ref(false);
const editingId = ref(null);
const deviceManagerVisible = ref(false);
const deviceFormVisible = ref(false);
const deviceFormRef = ref(null);
const deviceSaveLoading = ref(false);
const editingDeviceId = ref(null);
const currentRanch = ref(null);

const defaultForm = () => ({
  id: null,
  name: "",
  address: "",
  type: "猪舍",
  status: "运营",
});

const searchForm = reactive({
  keyword: "",
  type: "",
  status: "",
});

const deviceSearch = reactive({
  keyword: "",
  status: "",
});

const ranches = ref([
  { id: 1, name: "A区猪舍", address: "成都市高新区A区", type: "猪舍", status: "运营" },
  { id: 2, name: "B区鸡舍", address: "成都市高新区B区", type: "鸡舍", status: "运营" },
  { id: 3, name: "C区牛舍", address: "成都市高新区C区", type: "牛舍", status: "停用" },
]);
const form = reactive(defaultForm());

const formRules = {
  name: [{ required: true, message: "请输入名称", trigger: "blur" }],
  address: [{ required: true, message: "请输入地址", trigger: "blur" }],
  type: [{ required: true, message: "请选择类型", trigger: "change" }],
  status: [{ required: true, message: "请选择状态", trigger: "change" }],
};

const feedRecords = ref([
  { time: "2026-03-25 08:00", farm: "A区猪舍", animal: "猪", quantity: 120, person: "李工" },
  { time: "2026-03-25 09:30", farm: "B区鸡舍", animal: "鸡", quantity: 80, person: "王工" },
]);

const animalRecords = ref([
  { id: "A-001", name: "母猪-01", species: "猪", age: "2岁", health: "良好" },
  { id: "B-002", name: "母鸡-05", species: "鸡", age: "1岁", health: "健康" },
]);

const deviceList = ref([
  { id: "D-001", ranchId: 1, name: "温湿度传感器", type: "传感器", status: "在线", location: "A区猪舍东侧" },
  { id: "D-002", ranchId: 2, name: "摄像头", type: "摄像机", status: "离线", location: "B区鸡舍入口" },
  { id: "D-003", ranchId: 1, name: "通风控制器", type: "控制器", status: "维护中", location: "A区猪舍配电箱" },
]);

const defaultDeviceForm = () => ({
  id: "",
  ranchId: null,
  name: "",
  type: "传感器",
  status: "在线",
  location: "",
});

const deviceForm = reactive(defaultDeviceForm());

const dialogTitle = computed(() => (editingId.value ? "编辑养殖场" : "新增养殖场"));
const deviceDialogTitle = computed(() => (editingDeviceId.value ? "编辑设备" : "新增设备"));

const filteredRanches = computed(() => {
  const keyword = searchForm.keyword.trim().toLowerCase();

  return ranches.value.filter((item) => {
    const matchesKeyword =
      !keyword ||
      [item.name, item.address, item.type, item.status].some((field) =>
        field.toLowerCase().includes(keyword),
      );
    const matchesType = !searchForm.type || item.type === searchForm.type;
    const matchesStatus = !searchForm.status || item.status === searchForm.status;
    return matchesKeyword && matchesType && matchesStatus;
  });
});

const filteredDevices = computed(() => {
  const keyword = deviceSearch.keyword.trim().toLowerCase();
  const ranchId = currentRanch.value?.id;

  return deviceList.value.filter((item) => {
    const matchesRanch = !ranchId || item.ranchId === ranchId;
    const matchesKeyword =
      !keyword ||
      [item.id, item.name, item.type, item.location, item.status].some((field) =>
        field.toLowerCase().includes(keyword),
      );
    const matchesStatus = !deviceSearch.status || item.status === deviceSearch.status;
    return matchesRanch && matchesKeyword && matchesStatus;
  });
});

const ranchDeviceCount = computed(() => {
  const ranchId = currentRanch.value?.id;
  if (!ranchId) return 0;
  return deviceList.value.filter((item) => item.ranchId === ranchId).length;
});

const deviceRules = {
  name: [{ required: true, message: "请输入设备名称", trigger: "blur" }],
  type: [{ required: true, message: "请选择设备类型", trigger: "change" }],
  status: [{ required: true, message: "请选择设备状态", trigger: "change" }],
  location: [{ required: true, message: "请输入安装位置", trigger: "blur" }],
};

const handleSearch = () => {
  ElMessage.success(`已筛选出 ${filteredRanches.value.length} 条记录`);
};

const resetSearch = () => {
  searchForm.keyword = "";
  searchForm.type = "";
  searchForm.status = "";
};

const handleDeviceSearch = () => {
  ElMessage.success(`已筛选出 ${filteredDevices.value.length} 台设备`);
};

const resetDeviceSearch = () => {
  deviceSearch.keyword = "";
  deviceSearch.status = "";
};

const openDeviceManager = (row) => {
  currentRanch.value = row;
  resetDeviceSearch();
  deviceManagerVisible.value = true;
};

const openForm = (row) => {
  if (row) {
    editingId.value = row.id;
    Object.assign(form, row);
  } else {
    editingId.value = null;
    Object.assign(form, defaultForm());
  }
  formVisible.value = true;
};

const saveForm = async () => {
  if (!ranchFormRef.value || saveLoading.value) return;

  try {
    await ranchFormRef.value.validate();
  } catch {
    return;
  }

  saveLoading.value = true;

  try {
    if (editingId.value) {
      const idx = ranches.value.findIndex((item) => item.id === editingId.value);
      if (idx !== -1) ranches.value[idx] = { ...form, id: editingId.value };
      ElMessage.success("养殖场已更新");
    } else {
      const newId = ranches.value.length ? Math.max(...ranches.value.map((i) => i.id)) + 1 : 1;
      ranches.value.unshift({ ...form, id: newId });
      ElMessage.success("养殖场已新增");
    }
    formVisible.value = false;
    Object.assign(form, defaultForm());
    editingId.value = null;
  } finally {
    saveLoading.value = false;
  }
};

const removeRanch = (row) => {
  ElMessageBox.confirm("确认删除该养殖场吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    ranches.value = ranches.value.filter((item) => item.id !== row.id);
    ElMessage.success("删除成功");
  });
};

const openDeviceForm = (row) => {
  if (row) {
    editingDeviceId.value = row.id;
    Object.assign(deviceForm, row);
  } else {
    editingDeviceId.value = null;
    Object.assign(deviceForm, { ...defaultDeviceForm(), ranchId: currentRanch.value?.id || null });
  }
  deviceFormVisible.value = true;
};

const saveDeviceForm = async () => {
  if (!deviceFormRef.value || deviceSaveLoading.value) return;

  try {
    await deviceFormRef.value.validate();
  } catch {
    return;
  }

  deviceSaveLoading.value = true;

  try {
    if (editingDeviceId.value) {
      const idx = deviceList.value.findIndex((item) => item.id === editingDeviceId.value);
      if (idx !== -1) deviceList.value[idx] = { ...deviceForm, id: editingDeviceId.value };
      ElMessage.success("设备已更新");
    } else {
      const nextNumber =
        deviceList.value.length
          ? Math.max(...deviceList.value.map((item) => Number(item.id.replace("D-", "")) || 0)) + 1
          : 1;
      const newId = `D-${String(nextNumber).padStart(3, "0")}`;
      deviceList.value.unshift({ ...deviceForm, id: newId });
      ElMessage.success("设备已新增");
    }
    deviceFormVisible.value = false;
    Object.assign(deviceForm, defaultDeviceForm());
    editingDeviceId.value = null;
  } finally {
    deviceSaveLoading.value = false;
  }
};

const removeDevice = (row) => {
  ElMessageBox.confirm("确认删除该设备吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    deviceList.value = deviceList.value.filter((item) => item.id !== row.id);
    ElMessage.success("设备删除成功");
  });
};

const handleDeviceStatusChange = (row) => {
  ElMessage.success(`${row.name} 状态已切换为${row.status}`);
};
</script>

<style scoped>
.ranch-management {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.ranch-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  gap: 12px;
  flex-wrap: wrap;
}
.ranch-title {
  font-size: 18px;
  font-weight: 600;
}
.ranch-ops {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.ranch-summary {
  display: flex;
  gap: 20px;
  margin-bottom: 14px;
  color: #606266;
  font-size: 13px;
}
.device-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}
.device-summary {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
  color: #606266;
  font-size: 13px;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
