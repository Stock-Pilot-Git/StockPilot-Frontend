import { api } from "../../axios";

export const getDataTransaction = async () => {
    try {
      const response = await api.get('/api/inventory');
      return response.data;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  };

