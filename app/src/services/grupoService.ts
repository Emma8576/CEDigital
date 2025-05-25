/**
 * Obtiene los profesores asignados a un grupo específico
 */
import axios from "axios";
import { API_BASE_URL } from '../config';
export const getProfesoresPorGrupo = async (idGrupo: number): Promise<Profesor[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/ProfesorGrupo/${idGrupo}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener profesores para el grupo ${idGrupo}:`, error);
    return [];
  }
};

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
  profesores?: Profesor[];
}

export interface Curso {
  codigoCurso: string;
  nombreCurso: string;
}

export interface Semestre {
  idSemestre: number;
  año: number;
  periodo: number;
}

export interface Profesor {
  cedula: string;
  nombre: string;
}

/**
 * Obtiene la lista de todos los grupos con sus profesores
 */
export const getGrupos = async (): Promise<Grupo[]> => {
  try {
    const response = await axios.get(`${API_URL}/Grupo`);
    const grupos = response.data;
    
    // Comentado: Obtención de profesores para cada grupo
    /*
    // Para cada grupo, obtener los profesores asignados
    const gruposConProfesores = await Promise.all(
      grupos.map(async (grupo: Grupo) => {
        try {
          const profesoresResponse = await axios.get(`${API_URL}/ProfesorGrupo/${grupo.idGrupo}`);
          return {
            ...grupo,
            profesores: profesoresResponse.data
          };
        } catch (error: any) {
          // Verificamos si el error es un 404 por grupo sin profesores
          if (axios.isAxiosError(error) && error.response?.status === 404) {
            return {
              ...grupo,
              profesores: []
            };
          }

          // Si es otro error, lo mostramos y continuamos
          console.error(`Error al obtener profesores para el grupo ${grupo.idGrupo}:`, error);
          return {
            ...grupo,
            profesores: []
          };
        }
      })
    );
    
    return gruposConProfesores;
    */
    
    // Retornar solo los grupos sin obtener profesores
    return grupos;
  } catch (error) {
    console.error("Error al obtener grupos:", error);
    throw error;
  }
};

/**
 * Obtiene la lista de todos los cursos
 */
export const getCursos = async (): Promise<Curso[]> => {
  try {
    const response = await axios.get(`${API_URL}/Curso`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener cursos:", error);
    throw error;
  }
};

/**
 * Obtiene la lista de todos los semestres
 */
export const getSemestres = async (): Promise<Semestre[]> => {
  try {
    const response = await axios.get(`${API_URL}/Semestre`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener semestres:", error);
    throw error;
  }
};

/**
 * Obtiene la lista de todos los profesores
 */
export const getProfesores = async (): Promise<Profesor[]> => {
  try {
    const response = await axios.get(`${API_URL}/Profesor`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener profesores:", error);
    throw error;
  }
};

/**
 * Crea un nuevo grupo
 */
export const crearGrupo = async (
  codigoCurso: string,
  idSemestre: number,
  numeroGrupo: number
): Promise<Grupo> => {
  try {
    const response = await axios.post(`${API_URL}/Grupo`, {
      codigoCurso,
      idSemestre,
      numeroGrupo,
    });
    return response.data;
  } catch (error) {
    console.error("Error al crear grupo:", error);
    throw error;
  }
};

/**
 * Asigna profesores a un grupo específico
 */
export const asignarProfesoresAGrupo = async (
  idGrupo: number,
  cedulasProfesores: string[]
): Promise<any> => {
  try {
    const response = await axios.post(`${API_URL}/ProfesorGrupo`, {
      idGrupo,
      cedulasProfesores,
    });
    return response.data;
  } catch (error) {
    console.error("Error al asignar profesores:", error);
    throw error;
  }
};