import request from "../utils/request";

// 本地模拟数据存储
let mockRanches = JSON.parse(localStorage.getItem('mockRanches') || '[]');
if (mockRanches.length === 0) {
  // 初始化模拟数据
  mockRanches = [
    {
      id: 1,
      name: "示范猪场",
      province: "四川省",
      city: "成都市",
      district: "高新区",
      address: "四川省成都市高新区天府大道123号",
      scale: 1000,
      type: "猪舍",
      status: "运营"
    },
    {
      id: 2,
      name: "绿色鸡场",
      province: "四川省",
      city: "绵阳市",
      district: "涪城区",
      address: "四川省绵阳市涪城区花园路456号",
      scale: 500,
      type: "鸡舍",
      status: "运营"
    },
    {
      id: 3,
      name: "生态牛场",
      province: "四川省",
      city: "德阳市",
      district: "旌阳区",
      address: "四川省德阳市旌阳区生态路789号",
      scale: 200,
      type: "牛舍",
      status: "停用"
    }
  ];
  localStorage.setItem('mockRanches', JSON.stringify(mockRanches));
}

export function getRanches(params) {
  // 返回本地模拟数据
  let filtered = [...mockRanches];
  
  if (params?.keyword) {
    const keyword = params.keyword.toLowerCase();
    filtered = filtered.filter(ranch => 
      ranch.name.toLowerCase().includes(keyword) ||
      ranch.address.toLowerCase().includes(keyword) ||
      ranch.type.toLowerCase().includes(keyword) ||
      ranch.status.toLowerCase().includes(keyword)
    );
  }
  
  if (params?.type) {
    filtered = filtered.filter(ranch => ranch.type === params.type);
  }
  
  if (params?.status) {
    filtered = filtered.filter(ranch => ranch.status === params.status);
  }
  
  return Promise.resolve({
    data: filtered,
    total: filtered.length,
    current: 1,
    size: filtered.length
  });
}

export function createRanch(data) {
  const newRanch = {
    id: Date.now(),
    ...data
  };
  mockRanches.push(newRanch);
  localStorage.setItem('mockRanches', JSON.stringify(mockRanches));
  return Promise.resolve({ success: true, data: newRanch });
}

export function updateRanch(id, data) {
  const index = mockRanches.findIndex(r => r.id == id);
  if (index !== -1) {
    mockRanches[index] = { ...mockRanches[index], ...data };
    localStorage.setItem('mockRanches', JSON.stringify(mockRanches));
    return Promise.resolve({ success: true, data: mockRanches[index] });
  }
  return Promise.reject(new Error('养殖场不存在'));
}

export function deleteRanch(id) {
  const index = mockRanches.findIndex(r => r.id == id);
  if (index !== -1) {
    mockRanches.splice(index, 1);
    localStorage.setItem('mockRanches', JSON.stringify(mockRanches));
    return Promise.resolve({ success: true });
  }
  return Promise.reject(new Error('养殖场不存在'));
}
