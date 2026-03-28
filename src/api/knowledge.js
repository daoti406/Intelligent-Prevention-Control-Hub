import request from "../utils/request";

export function getKnowledgeList(params) {
  return request({
    url: "/knowledge",
    method: "get",
    params,
  });
}

export function createKnowledge(data) {
  return request({
    url: "/knowledge",
    method: "post",
    data,
  });
}
