import axios from "axios";

export interface Carrera {
  idCarrera: number;
  nombreCarrera: string;
}

export const obtenerCarreras = () => {
  return axios.get<Carrera[]>("http://localhost:5261/api/carrera"); 
};
