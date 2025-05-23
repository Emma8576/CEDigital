import axios from "axios";

const API_URL = "http://localhost:5261/api/CargarSemestre";

export const cargarSemestreService = async (archivo: File) => {
  const formData = new FormData();
  formData.append("file", archivo);

  const response = await axios.post(`${API_URL}/cargar`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
