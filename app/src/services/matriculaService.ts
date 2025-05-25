import axios from "axios";
import { API_BASE_URL } from '../config';

// URL base para todas las llamadas a la API
const API_URL = `${API_BASE_URL}`;

// Interfaces para tipar los datos
export interface Grupo {
  idGrupo: number;
  codigoCurso: string;
  idSemestre: number;
  numeroGrupo: number;
  curso?: Curso;
  semestre?: Semestre;
  estudiantes?: Estudiante[];

}
export interface GrupoConCurso {
  idGrupo: number;
  numeroGrupo: number;
  nombreCurso: string;
  codigoCurso?: string; 
}
export interface GrupoResumen {
  idGrupo: number;
  numeroGrupo: number;
  codigoCurso: string;
  nombreCurso: string;
  cantidadEstudiantes: number;
}
export const getGruposConCurso = async (): Promise<GrupoConCurso[]> => {
  const response = await axios.get(`${API_BASE_URL}/Grupo/conCursos`);
  return response.data;
};

export const obtenerGruposConCantidadEstudiantes = async (): Promise<GrupoResumen[]> => {
  const response = await axios.get(`${API_BASE_URL}/EstudianteGrupo/grupos-con-cantidad`);
  return response.data;
};

export interface Curso {
  codigoCurso: string;
  nombreCurso: string;
}

export interface Semestre {
  idSemestre: number;
  año: number;
  periodo: number;
}

export interface Estudiante {
  carne: string;
  nombre: string;
}

/**
 * Obtiene los estudiantes asignados a un grupo específico
 */
export const getEstudiantesPorGrupo = async (idGrupo: number): Promise<Estudiante[]> => {
  try {
    const response = await axios.get(`${API_URL}/EstudianteGrupo/${idGrupo}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener estudiantes para el grupo ${idGrupo}:`, error);
    return [];
  }
};

/**
 * Obtiene la lista de todos los grupos
 */
export const getGrupos = async (): Promise<Grupo[]> => {
  try {
    const response = await axios.get(`${API_URL}/Grupo`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener grupos:", error);
    throw error;
  }
};

/**
 * Obtiene la lista de todos los estudiantes
 */
export const getEstudiantes = async (): Promise<Estudiante[]> => {
  try {
    const response = await axios.get(`${API_URL}/Estudiante`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener estudiantes:", error);
    throw error;
  }
};

/**
 * Asigna estudiantes a un grupo específico
 */
export const asignarEstudiantesAGrupo = async (
  idGrupo: number,
  carnesEstudiantes: string[]
): Promise<any> => {
  try {
    const payload = {
      IdGrupo: idGrupo,
      CarnetsEstudiantes: carnesEstudiantes.map(c => c.toString()), 
    };
    console.log("Datos enviados al backend:", payload);
    const response = await axios.post(`${API_URL}/EstudianteGrupo`, payload);
    return response.data;
  } catch (error) {
    console.error("Error al asignar estudiantes:", error);
    throw error;
  }
};


