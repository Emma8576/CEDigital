import axios from 'axios';
import { API_BASE_URL } from '../config';

// Configura axios con una base URL y headers adecuados
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para manejo centralizado de errores
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

const API_URL = '/Curso';

export interface Curso {
  codigoCurso: string;
  nombreCurso: string;
  creditos: number;
  idCarrera: number;
  carrera?: {
    idCarrera: number;
    nombreCarrera: string;
  };
}

export interface CursoCreateDto {
  codigoCurso: string;
  nombreCurso: string;
  creditos: number;
  idCarrera: number;
}

export interface CursoUpdateDto {
  nombreCurso: string;
  creditos: number;
  idCarrera: number;
}

// Obtener todos los cursos
export const obtenerCursos = async () => {
  try {
    return await axiosInstance.get<Curso[]>(API_URL);
  } catch (error: any) {
    console.error('Original error fetching courses in service:', error);
    throw new Error(error.message || 'Error al obtener los cursos');
  }
};

// Obtener un curso específico por código
export const obtenerCursoPorCodigo = async (codigo: string) => {
  try {
    return await axiosInstance.get<Curso>(`${API_URL}/${codigo}`);
  } catch (error: any) {
    console.error(`Error al obtener curso ${codigo}:`, error);
    throw new Error(error.message || 'Error al obtener el curso');
  }
};

// Crear un nuevo curso
export const crearCurso = async (curso: CursoCreateDto) => {
  try {
    return await axiosInstance.post<Curso>(API_URL, curso);
  } catch (error: any) {
    console.error('Error al crear curso:', error);
    throw new Error(error.message || 'Error al crear el curso');
  }
};

// Actualizar un curso
export const actualizarCurso = async (codigo: string, curso: CursoUpdateDto) => {
  try {
    return await axiosInstance.put<void>(`${API_URL}/${codigo}`, curso);
  } catch (error: any) {
    console.error(`Error al actualizar curso ${codigo}:`, error);
    throw new Error(error.message || 'Error al actualizar el curso');
  }
};

// Eliminar un curso
export const eliminarCurso = async (codigo: string) => {
  try {
    return await axiosInstance.delete<void>(`${API_URL}/${codigo}`);
  } catch (error: any) {
    console.error(`Error al eliminar curso ${codigo}:`, error);
    throw new Error(error.message || 'Error al eliminar el curso');
  }
};