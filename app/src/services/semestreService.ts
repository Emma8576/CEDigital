import axios from "axios";

const API_URL = "http://localhost:5261/api/Semestre";

export const obtenerSemestres = () => {
  return axios.get(API_URL);
};

export const crearSemestre = (semestre: { año: number; periodo: string }) => {
  return axios.post(API_URL, semestre);
};

export const eliminarSemestre = (id: number) => {
  return axios.delete(`${API_URL}/${id}`);
};

export const obtenerSemestreCantidadGrupos = (id: number) => {
  return axios.get(`${API_URL}/${id}/cantidad-grupos`);
};
