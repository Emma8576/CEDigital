import axios from 'axios';

// Configura axios con una base URL y headers adecuados
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5261',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para manejo centralizado de errores
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Procesar el error para extraer el mensaje más útil
    if (error.response) {
      // Error HTTP con respuesta del servidor
      const status = error.response.status;
      let mensaje = error.response.data;
      
      // Si la respuesta es un string, úsala directamente
      if (typeof mensaje === 'string') {
        error.message = mensaje;
      }
      // Si es un objeto con mensaje
      else if (mensaje && typeof mensaje === 'object') {
        if (mensaje.message) {
          error.message = mensaje.message;
        } else if (mensaje.title) {
          error.message = mensaje.title;
        } else if (mensaje.error) {
          error.message = mensaje.error;
        }
      }
      // Mensajes por defecto según el código de estado
      else {
        switch (status) {
          case 400:
            error.message = 'Solicitud incorrecta';
            break;
          case 404:
            error.message = 'Recurso no encontrado';
            break;
          case 409:
            error.message = 'Conflicto con el estado actual del recurso';
            break;
          case 500:
            error.message = 'Error interno del servidor';
            break;
          default:
            error.message = `Error del servidor (${status})`;
        }
      }
    } else if (error.request) {
      // Error de red
      error.message = 'Error de conexión con el servidor';
    } else {
      // Otro tipo de error
      error.message = error.message || 'Error desconocido';
    }
    
    return Promise.reject(error);
  }
);

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
export const obtenerCursos = async () => {
  try {
    return await axiosInstance.get<Curso[]>(API_URL);
  } catch (error: any) {
    console.error('Error al obtener cursos:', error);
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