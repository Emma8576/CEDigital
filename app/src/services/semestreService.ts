import axios from "axios";
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/Semestre`;

// Obtiene la lista de todos los semestres
export const obtenerSemestres = () => {
  return axios.get(API_URL);
};

// Crea un nuevo semestre con año y periodo
export const crearSemestre = (semestre: { año: number; periodo: string }) => {
  return axios.post(API_URL, semestre);
};

// Elimina un semestre por su ID
export const eliminarSemestre = (id: number) => {
  return axios.delete(`${API_URL}/${id}`);
};

// Obtiene la cantidad de grupos asociados a un semestre específico
export const obtenerSemestreCantidadGrupos = (id: number) => {
  return axios.get(`${API_URL}/${id}/cantidad-grupos`);
};
