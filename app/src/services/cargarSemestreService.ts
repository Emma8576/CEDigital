import axios from "axios";
import { API_BASE_URL } from '../config';

// URL base del endpoint para cargar semestres desde Excel
const API_URL = `${API_BASE_URL}/CargarSemestre`;

/**
 * Servicio para enviar un archivo Excel al backend y cargar un semestre completo.
 * @param archivo 
 * @returns 
 */
export const cargarSemestreService = async (archivo: File) => {
  // Se construye un FormData para enviar el archivo en el cuerpo de la petición
  const formData = new FormData();
  formData.append("file", archivo);

  // Se hace la petición POST al backend con el archivo adjunto
  const response = await axios.post(`${API_URL}/cargar`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  // Se retorna el contenido de la respuesta
  return response.data;
};
