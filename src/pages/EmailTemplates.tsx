import axios from "axios";
import API_URL from '@/components/api';

const API = API_URL;

export const getTemplates = async () => {
  const response = await axios.get(`${API}/email-templates`);
  return response.data.data;
};

export const createTemplate = async (data) => {
  const response = await axios.post(
    `${API}/email-templates`,
    data
  );

  return response.data;
};

export const deleteTemplate = async (id) => {
  const response = await axios.delete(
    `${API}/email-templates/${id}`
  );

  return response.data;
};