import axios from 'axios';

// Configura axios con una base URL y headers adecuados
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5261',
  headers: {
    'Content-Type': 'application/json'
  }
});

const API_URL = '/api/Curso';

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
export const obtenerCursos = () => {
  return axiosInstance.get<Curso[]>(API_URL);
};

// Obtener un curso específico por código
export const obtenerCursoPorCodigo = (codigo: string) => {
  return axiosInstance.get<Curso>(`${API_URL}/${codigo}`);
};

// Crear un nuevo curso
export const crearCurso = (curso: CursoCreateDto) => {
  return axiosInstance.post<Curso>(API_URL, curso);
};

// Actualizar un curso
export const actualizarCurso = (codigo: string, curso: CursoUpdateDto) => {
  return axiosInstance.put<void>(`${API_URL}/${codigo}`, curso);
};

// Eliminar un curso
export const eliminarCurso = (codigo: string) => {
  return axiosInstance.delete<void>(`${API_URL}/${codigo}`);
};
