import axios from "axios";
import { Profesor } from "../pages/GestionProfesores";
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/Profesor`;

// Obtiene la lista de profesores desde la API
export const obtenerProfesores = () => {
  return axios.get(API_URL);
};

// Envía un nuevo profesor para ser registrado en la base de datos
export const crearProfesor = (profesor: Profesor) => {
  return axios.post(API_URL, profesor);
};
