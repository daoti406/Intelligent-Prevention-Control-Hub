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
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-select
              v-model="row.status"
              size="small"
              @change="handleRanchStatusChange(row)"
            >
              <el-option label="运营" value="运营" />
              <el-option label="停用" value="停用" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="openForm(row)">编辑</el-button>
            <el-button type="success" size="small" @click="openDeviceManager(row)">设备管理</el-button>
            <el-button type="danger" size="small" @click="removeRanch(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="record-panel">
        <el-tabs v-model="currentTab" type="border-card">
          <el-tab-pane label="饲喂记录" name="feed">
            <div class="sub-toolbar">
              <el-input
                v-model="feedSearch.keyword"
                placeholder="搜索养殖场/畜禽类型/负责人"
                size="small"
                clearable
                style="width: 260px"
                @keyup.enter="handleFeedSearch"
              />
              <el-button type="primary" size="small" @click="handleFeedSearch">搜索</el-button>
              <el-button size="small" @click="resetFeedSearch">重置</el-button>
              <el-button type="success" size="small" @click="openFeedForm()">新增记录</el-button>
            </div>
            <div class="sub-summary">
              <span>共 {{ feedRecords.length }} 条饲喂记录</span>
              <span>当前显示 {{ filteredFeedRecords.length }} 条</span>
            </div>
            <el-table :data="filteredFeedRecords" border empty-text="暂无符合条件的饲喂记录">
              <el-table-column prop="time" label="时间" width="180" />
              <el-table-column prop="farm" label="养殖场" width="180" />
              <el-table-column prop="animal" label="畜禽类型" width="120" />
              <el-table-column prop="quantity" label="饲料量(kg)" width="120" />
              <el-table-column prop="person" label="负责人" width="120" />
              <el-table-column label="操作" width="120">
                <template #default="{ row }">
                  <el-button type="danger" size="small" @click="removeFeedRecord(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <el-tab-pane label="畜禽档案" name="animal">
            <div class="sub-toolbar">
              <el-input
                v-model="animalSearch.keyword"
                placeholder="搜索档案ID/名称/品种/健康状态"
                size="small"
                clearable
                style="width: 280px"
                @keyup.enter="handleAnimalSearch"
              />
              <el-button type="primary" size="small" @click="handleAnimalSearch">搜索</el-button>
              <el-button size="small" @click="resetAnimalSearch">重置</el-button>
              <el-button type="success" size="small" @click="openAnimalForm()">新增档案</el-button>
            </div>
            <div class="sub-summary">
              <span>共 {{ animalRecords.length }} 条畜禽档案</span>
              <span>当前显示 {{ filteredAnimalRecords.length }} 条</span>
            </div>
            <el-table :data="filteredAnimalRecords" border empty-text="暂无符合条件的畜禽档案">
              <el-table-column prop="id" label="档案ID" width="120" />
              <el-table-column prop="name" label="名称" width="160" />
              <el-table-column prop="species" label="品种" width="120" />
              <el-table-column prop="age" label="年龄" width="100" />
              <el-table-column prop="health" label="健康状态" width="120" />
              <el-table-column label="操作" width="120">
                <template #default="{ row }">
                  <el-button type="danger" size="small" @click="removeAnimalRecord(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>

    <el-dialog
      :title="dialogTitle"
      v-model="formVisible"
      width="500px"
      :destroy-on-close="true"
      @closed="resetRanchDialog"
    >
      <el-form
        :model="form"
        :rules="formRules"
        ref="ranchFormRef"
        label-position="top"
        status-icon
        class="ranch-dialog-form"
        @submit.prevent
      >
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
          <el-button @click="formVisible = false">取消</el-button>
          <el-button type="primary" :loading="saveLoading" @click="saveForm">确认</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      :title="deviceDialogTitle"
      v-model="deviceFormVisible"
      width="520px"
      :destroy-on-close="true"
      @closed="resetDeviceDialog"
    >
      <el-form
        :model="deviceForm"
        :rules="deviceRules"
        ref="deviceFormRef"
        label-position="top"
        status-icon
        class="ranch-dialog-form"
        @submit.prevent
      >
        <el-form-item label="设备名称" prop="name">
          <el-input v-model="deviceForm.name" />
        </el-form-item>
        <el-form-item label="设备类型" prop="type">
          <el-select v-model="deviceForm.type" placeholder="请选择类型">
            <el-option label="传感器" value="传感器" />
            <el-option label="摄像头" value="摄像头" />
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
          <el-button @click="deviceFormVisible = false">取消</el-button>
          <el-button type="primary" :loading="deviceSaveLoading" @click="saveDeviceForm">确认</el-button>
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
        <el-table-column prop="id" label="设备ID" width="130" />
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

    <el-dialog
      title="新增饲喂记录"
      v-model="feedFormVisible"
      width="520px"
      :destroy-on-close="true"
      @closed="resetFeedDialog"
    >
      <el-form
        :model="feedForm"
        :rules="feedRules"
        ref="feedFormRef"
        label-position="top"
        status-icon
        class="ranch-dialog-form"
        @submit.prevent
      >
        <el-form-item label="时间" prop="time">
          <el-input v-model="feedForm.time" placeholder="例如：2026-03-28 08:00" />
        </el-form-item>
        <el-form-item label="养殖场" prop="farm">
          <el-input v-model="feedForm.farm" />
        </el-form-item>
        <el-form-item label="畜禽类型" prop="animal">
          <el-select v-model="feedForm.animal" placeholder="请选择畜禽类型">
            <el-option label="猪" value="猪" />
            <el-option label="鸡" value="鸡" />
            <el-option label="牛" value="牛" />
          </el-select>
        </el-form-item>
        <el-form-item label="饲料量(kg)" prop="quantity">
          <el-input v-model="feedForm.quantity" />
        </el-form-item>
        <el-form-item label="负责人" prop="person">
          <el-input v-model="feedForm.person" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="feedFormVisible = false">取消</el-button>
          <el-button type="primary" :loading="feedSaveLoading" @click="saveFeedForm">确认</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      title="新增畜禽档案"
      v-model="animalFormVisible"
      width="520px"
      :destroy-on-close="true"
      @closed="resetAnimalDialog"
    >
      <el-form
        :model="animalForm"
        :rules="animalRules"
        ref="animalFormRef"
        label-position="top"
        status-icon
        class="ranch-dialog-form"
        @submit.prevent
      >
        <el-form-item label="档案ID" prop="id">
          <el-input v-model="animalForm.id" placeholder="例如：A-003" />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="animalForm.name" />
        </el-form-item>
        <el-form-item label="品种" prop="species">
          <el-select v-model="animalForm.species" placeholder="请选择品种">
            <el-option label="猪" value="猪" />
            <el-option label="鸡" value="鸡" />
            <el-option label="牛" value="牛" />
          </el-select>
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input v-model="animalForm.age" placeholder="例如：2岁" />
        </el-form-item>
        <el-form-item label="健康状态" prop="health">
          <el-input v-model="animalForm.health" placeholder="例如：健康 / 良好" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="animalFormVisible = false">取消</el-button>
          <el-button type="primary" :loading="animalSaveLoading" @click="saveAnimalForm">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
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

const feedFormVisible = ref(false);
const feedFormRef = ref(null);
const feedSaveLoading = ref(false);

const animalFormVisible = ref(false);
const animalFormRef = ref(null);
const animalSaveLoading = ref(false);

const defaultForm = () => ({
  id: null,
  name: "",
  address: "",
  type: "猪舍",
  status: "运营",
});

const defaultDeviceForm = () => ({
  id: "",
  ranchId: null,
  name: "",
  type: "传感器",
  status: "在线",
  location: "",
});

const defaultFeedForm = () => ({
  time: "",
  farm: "",
  animal: "猪",
  quantity: "",
  person: "",
});

const defaultAnimalForm = () => ({
  id: "",
  name: "",
  species: "猪",
  age: "",
  health: "",
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

const feedSearch = reactive({
  keyword: "",
});

const animalSearch = reactive({
  keyword: "",
});

const ranches = ref([
  { id: 1, name: "A区猪舍", address: "成都市高新区A区", type: "猪舍", status: "运营" },
  { id: 2, name: "B区鸡舍", address: "成都市高新区B区", type: "鸡舍", status: "运营" },
  { id: 3, name: "C区牛舍", address: "成都市高新区C区", type: "牛舍", status: "停用" },
]);

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
  { id: "D-002", ranchId: 2, name: "摄像头", type: "摄像头", status: "离线", location: "B区鸡舍入口" },
  { id: "D-003", ranchId: 1, name: "通风控制器", type: "控制器", status: "维护中", location: "A区猪舍配电箱" },
]);

const form = reactive(defaultForm());
const deviceForm = reactive(defaultDeviceForm());
const feedForm = reactive(defaultFeedForm());
const animalForm = reactive(defaultAnimalForm());

const formRules = {
  name: [{ required: true, message: "请输入名称", trigger: "blur" }],
  address: [{ required: true, message: "请输入地址", trigger: "blur" }],
  type: [{ required: true, message: "请选择类型", trigger: "change" }],
  status: [{ required: true, message: "请选择状态", trigger: "change" }],
};

const deviceRules = {
  name: [{ required: true, message: "请输入设备名称", trigger: "blur" }],
  type: [{ required: true, message: "请选择设备类型", trigger: "change" }],
  status: [{ required: true, message: "请选择设备状态", trigger: "change" }],
  location: [{ required: true, message: "请输入安装位置", trigger: "blur" }],
};

const feedRules = {
  time: [{ required: true, message: "请输入时间", trigger: "blur" }],
  farm: [{ required: true, message: "请输入养殖场", trigger: "blur" }],
  animal: [{ required: true, message: "请选择畜禽类型", trigger: "change" }],
  quantity: [{ required: true, message: "请输入饲料量", trigger: "blur" }],
  person: [{ required: true, message: "请输入负责人", trigger: "blur" }],
};

const animalRules = {
  id: [{ required: true, message: "请输入档案ID", trigger: "blur" }],
  name: [{ required: true, message: "请输入名称", trigger: "blur" }],
  species: [{ required: true, message: "请选择品种", trigger: "change" }],
  age: [{ required: true, message: "请输入年龄", trigger: "blur" }],
  health: [{ required: true, message: "请输入健康状态", trigger: "blur" }],
};

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

const filteredFeedRecords = computed(() => {
  const keyword = feedSearch.keyword.trim().toLowerCase();
  return feedRecords.value.filter((item) =>
    !keyword ||
    [item.time, item.farm, item.animal, String(item.quantity), item.person].some((field) =>
      String(field).toLowerCase().includes(keyword),
    ),
  );
});

const filteredAnimalRecords = computed(() => {
  const keyword = animalSearch.keyword.trim().toLowerCase();
  return animalRecords.value.filter((item) =>
    !keyword ||
    [item.id, item.name, item.species, item.age, item.health].some((field) =>
      String(field).toLowerCase().includes(keyword),
    ),
  );
});

const ranchDeviceCount = computed(() => {
  const ranchId = currentRanch.value?.id;
  if (!ranchId) return 0;
  return deviceList.value.filter((item) => item.ranchId === ranchId).length;
});

const handleSearch = () => {
  ElMessage.success(`已筛选出 ${filteredRanches.value.length} 条养殖场记录`);
};

const resetSearch = () => {
  searchForm.keyword = "";
  searchForm.type = "";
  searchForm.status = "";
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

const resetRanchDialog = () => {
  ranchFormRef.value?.clearValidate();
  Object.assign(form, defaultForm());
  editingId.value = null;
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
    deviceList.value = deviceList.value.filter((item) => item.ranchId !== row.id);
    ElMessage.success("删除成功");
  });
};

const handleRanchStatusChange = (row) => {
  ElMessage.success(`${row.name} 状态已切换为 ${row.status}`);
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

const openDeviceForm = (row) => {
  if (row) {
    editingDeviceId.value = row.id;
    Object.assign(deviceForm, row);
  } else {
    editingDeviceId.value = null;
    Object.assign(deviceForm, {
      ...defaultDeviceForm(),
      ranchId: currentRanch.value?.id || null,
    });
  }
  deviceFormVisible.value = true;
};

const resetDeviceDialog = () => {
  deviceFormRef.value?.clearValidate();
  Object.assign(deviceForm, defaultDeviceForm());
  editingDeviceId.value = null;
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
  ElMessage.success(`${row.name} 状态已切换为 ${row.status}`);
};

const handleFeedSearch = () => {
  ElMessage.success(`已筛选出 ${filteredFeedRecords.value.length} 条饲喂记录`);
};

const resetFeedSearch = () => {
  feedSearch.keyword = "";
};

const openFeedForm = () => {
  Object.assign(feedForm, defaultFeedForm());
  feedFormVisible.value = true;
};

const resetFeedDialog = () => {
  feedFormRef.value?.clearValidate();
  Object.assign(feedForm, defaultFeedForm());
};

const saveFeedForm = async () => {
  if (!feedFormRef.value || feedSaveLoading.value) return;
  try {
    await feedFormRef.value.validate();
  } catch {
    return;
  }

  feedSaveLoading.value = true;
  try {
    feedRecords.value.unshift({ ...feedForm });
    feedFormVisible.value = false;
    ElMessage.success("饲喂记录已新增");
  } finally {
    feedSaveLoading.value = false;
  }
};

const removeFeedRecord = (row) => {
  ElMessageBox.confirm("确认删除该条饲喂记录吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    feedRecords.value = feedRecords.value.filter((item) => item !== row);
    ElMessage.success("饲喂记录删除成功");
  });
};

const handleAnimalSearch = () => {
  ElMessage.success(`已筛选出 ${filteredAnimalRecords.value.length} 条畜禽档案`);
};

const resetAnimalSearch = () => {
  animalSearch.keyword = "";
};

const openAnimalForm = () => {
  Object.assign(animalForm, defaultAnimalForm());
  animalFormVisible.value = true;
};

const resetAnimalDialog = () => {
  animalFormRef.value?.clearValidate();
  Object.assign(animalForm, defaultAnimalForm());
};

const saveAnimalForm = async () => {
  if (!animalFormRef.value || animalSaveLoading.value) return;
  try {
    await animalFormRef.value.validate();
  } catch {
    return;
  }

  animalSaveLoading.value = true;
  try {
    animalRecords.value.unshift({ ...animalForm });
    animalFormVisible.value = false;
    ElMessage.success("畜禽档案已新增");
  } finally {
    animalSaveLoading.value = false;
  }
};

const removeAnimalRecord = (row) => {
  ElMessageBox.confirm("确认删除该条畜禽档案吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    animalRecords.value = animalRecords.value.filter((item) => item.id !== row.id);
    ElMessage.success("畜禽档案删除成功");
  });
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

.ranch-ops,
.device-toolbar,
.sub-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.ranch-summary,
.device-summary,
.sub-summary {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
  color: #606266;
  font-size: 13px;
}

.record-panel {
  margin-top: 16px;
}

.ranch-dialog-form :deep(.el-form-item) {
  margin-bottom: 18px;
}

.ranch-dialog-form :deep(.el-input),
.ranch-dialog-form :deep(.el-select) {
  width: 100%;
}

.ranch-dialog-form :deep(.el-form-item__label) {
  font-weight: 600;
  color: #303133;
  padding-bottom: 6px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
