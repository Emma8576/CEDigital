import axios from "axios";

export const getGrupos = async () => {
  const response = await axios.get("http://localhost:5261/api/Grupo");
  return response.data;
};

export const getCursos = async () => {
  const response = await axios.get("http://localhost:5261/api/Curso");
  return response.data;
};

export const getSemestres = async () => {
  const response = await axios.get("http://localhost:5261/api/Semestre");
  return response.data;
};

export const crearGrupo = async (grupoData: {
  codigoCurso: string;
  idSemestre: number;
  numeroGrupo: number;
}) => {
  const response = await axios.post("http://localhost:5261/api/Grupo", grupoData);
  return response.data;
};
