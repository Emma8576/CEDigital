import axios from "axios";
import { Profesor } from "../pages/GestionProfesores";

const API_URL = "http://localhost:5261/api/Profesor";

export const obtenerProfesores = () => {
  return axios.get(API_URL);
};

export const crearProfesor = (profesor: Profesor) => {
  return axios.post(API_URL, profesor);
};
