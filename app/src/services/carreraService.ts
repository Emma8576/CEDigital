import axios from "axios";

export interface Carrera {
  IdCarrera: number;
  NombreCarrera: string;
}

export const obtenerCarreras = () => {
  return axios.get<Carrera[]>("http://localhost:5261/api/carreras"); 
};
