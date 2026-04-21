import request from "../utils/request";

export function getKnowledgeList(params) {
  return request({
    url: "/api/knowledge",
    method: "get",
    params
  });
}

export function getKnowledgeById(id) {
  return request({
    url: `/api/knowledge/${id}`,
    method: "get"
  });
}

export function createKnowledge(data) {
  return request({
    url: "/api/knowledge",
    method: "post",
    data
  });
}

export function updateKnowledge(id, data) {
  return request({
    url: `/api/knowledge/${id}`,
    method: "put",
    data
  });
}

export function deleteKnowledge(id) {
  return request({
    url: `/api/knowledge/${id}`,
    method: "delete"
  });
}
