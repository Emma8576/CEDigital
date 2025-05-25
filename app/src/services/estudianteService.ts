import axios from "axios";
import { Estudiante } from "../pages/GestionEstudiantes";
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/Estudiante`;

// Función para obtener la lista de estudiantes desde el backend
export const obtenerEstudiantes = () => {
  return axios.get(API_URL);
};

// Función para crear un nuevo estudiante enviando sus datos al backend
export const crearEstudiante = (estudiante: Estudiante) => {
  return axios.post(API_URL, estudiante);
};