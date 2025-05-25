import axios from "axios";
import { API_BASE_URL } from '../config';

// Interfaz que define la estructura de una carrera
export interface Carrera {
  idCarrera: number;
  nombreCarrera: string;
}

// Solicita al backend la lista de carreras registradas
export const obtenerCarreras = () => {
  return axios.get<Carrera[]>(`${API_BASE_URL}/carrera`); 
};
