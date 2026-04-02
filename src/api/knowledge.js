import request from "../utils/request";

// 本地模拟数据
const mockKnowledge = [
  {
    id: 1,
    title: "猪场防疫指南",
    content: "猪场防疫是保障生猪健康的重要措施。主要包括疫苗接种、消毒卫生、隔离检疫等方面...",
    category: "防疫知识",
    author: "兽医专家",
    publishTime: "2025-01-10",
    views: 1250,
  },
  {
    id: 2,
    title: "鸡舍温度控制最佳实践",
    content: "鸡舍温度直接影响鸡的生长发育和生产性能。适宜温度范围为...",
    category: "饲养技术",
    author: "养殖专家",
    publishTime: "2025-01-08",
    views: 980,
  },
  {
    id: 3,
    title: "牛舍湿度管理要点",
    content: "湿度过高或过低都会影响牛的健康。适宜湿度范围为50-70%...",
    category: "环境控制",
    author: "环境专家",
    publishTime: "2025-01-05",
    views: 756,
  },
];

export function getKnowledgeList(params) {
  // 返回本地模拟数据
  let filtered = [...mockKnowledge];
  
  if (params?.keyword) {
    const keyword = params.keyword.toLowerCase();
    filtered = filtered.filter(k => 
      k.title.toLowerCase().includes(keyword) ||
      k.content.toLowerCase().includes(keyword) ||
      k.category.toLowerCase().includes(keyword)
    );
  }
  
  if (params?.category) {
    filtered = filtered.filter(k => k.category === params.category);
  }
  
  return Promise.resolve({
    data: filtered,
    total: filtered.length,
    current: 1,
    size: filtered.length
  });
}

export function createKnowledge(data) {
  // 模拟创建
  const newKnowledge = {
    id: Date.now(),
    ...data,
    publishTime: new Date().toISOString().split('T')[0],
    views: 0,
  };
  mockKnowledge.push(newKnowledge);
  return Promise.resolve({ success: true, data: newKnowledge });
}
