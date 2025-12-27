// client/src/services/api.js
import axios from 'axios';

// Change this line:
const API_BASE_URL = 'https://kindred-1oob.onrender.com';

export const getWordHelp = async (word) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/word-help`, { 
      word 
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const getDefinition = async (word) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/define-word`, { 
      word 
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const getImagePrompt = async (word) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/generate-image-prompt`, { 
      word 
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};