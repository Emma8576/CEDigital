import axios from "axios";
import { Estudiante } from "../pages/GestionEstudiantes";

const API_URL = "http://localhost:5261/api/Estudiante";

export const obtenerEstudiantes = () => {
  return axios.get(API_URL);
};

export const crearEstudiante = (estudiante: Estudiante) => {
  return axios.post(API_URL, estudiante);
};