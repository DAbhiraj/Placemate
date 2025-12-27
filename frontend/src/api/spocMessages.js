import axiosClient from './axiosClient';

export const listConversations = async () => {
  const { data } = await axiosClient.get('/spoc/conversations');
  return data.conversations;
};

export const ensureConversation = async (jobId) => {
  const { data } = await axiosClient.post(`/spoc/jobs/${jobId}/conversation`);
  return data;
};

export const getMessages = async (conversationId, { limit = 50, before = null } = {}) => {
  const params = {};
  if (limit) params.limit = limit;
  if (before) params.before = before;
  const { data } = await axiosClient.get(`/conversations/${conversationId}/messages`, { params });
  return data.messages;
};

export const sendMessage = async (conversationId, content) => {
  const { data } = await axiosClient.post(`/conversations/${conversationId}/messages`, { content });
  return data;
};
