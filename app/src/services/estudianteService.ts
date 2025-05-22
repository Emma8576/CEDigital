import axios from "axios";
import { Estudiante } from "../pages/GestionEstudiantes";

const API_URL = "http://localhost:5261/api/estudiantes";

// Función para obtener la lista de estudiantes desde el backend
export const obtenerEstudiantes = () => {
  return axios.get(API_URL);
};

// Función para crear un nuevo estudiante enviando sus datos al backend
export const crearEstudiante = (estudiante: Estudiante) => {
  return axios.post(API_URL, estudiante);
};