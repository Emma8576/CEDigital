import axios from "axios";

// Interfaz que define la estructura de una carrera
export interface Carrera {
  idCarrera: number;
  nombreCarrera: string;
}

// Solicita al backend la lista de carreras registradas
export const obtenerCarreras = () => {
  return axios.get<Carrera[]>("http://localhost:5261/api/carrera"); 
};
