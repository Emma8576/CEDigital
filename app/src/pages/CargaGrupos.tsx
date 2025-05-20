import { useEffect, useState } from "react";
import { getGrupos, getCursos, getSemestres, crearGrupo } from "../services/grupoService";

const CargaGrupos = () => {
  const [grupos, setGrupos] = useState<any[]>([]);
  const [cursos, setCursos] = useState<any[]>([]);
  const [semestres, setSemestres] = useState<any[]>([]);

  const [codigoCurso, setCodigoCurso] = useState("");
  const [idSemestre, setIdSemestre] = useState<number | "">("");
  const [numeroGrupo, setNumeroGrupo] = useState<number>(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setGrupos(await getGrupos());
        setCursos(await getCursos());
        setSemestres(await getSemestres());
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoCurso || !idSemestre) return;

    try {
      await crearGrupo({ codigoCurso, idSemestre: Number(idSemestre), numeroGrupo });
      const nuevosGrupos = await getGrupos();
      setGrupos(nuevosGrupos);
      // Limpiar formulario
      setCodigoCurso("");
      setIdSemestre("");
      setNumeroGrupo(1);
    } catch (error) {
      console.error("Error al crear grupo:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Gestión de Grupos</h1>

      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div>
          <label className="block mb-1">Curso:</label>
          <select
            value={codigoCurso}
            onChange={(e) => setCodigoCurso(e.target.value)}
            className="border p-2 w-full"
            required
          >
            <option value="">Seleccione un curso</option>
            {cursos.map((curso) => (
              <option key={curso.codigoCurso} value={curso.codigoCurso}>
                {curso.codigoCurso} - {curso.nombreCurso}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">Semestre:</label>
          <select
            value={idSemestre}
            onChange={(e) => setIdSemestre(Number(e.target.value))}
            className="border p-2 w-full"
            required
          >
            <option value="">Seleccione un semestre</option>
            {semestres.map((semestre) => (
              <option key={semestre.idSemestre} value={semestre.idSemestre}>
                {semestre.año} - {semestre.periodo}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">Número de Grupo:</label>
          <input
            type="number"
            value={numeroGrupo}
            onChange={(e) => setNumeroGrupo(parseInt(e.target.value))}
            className="border p-2 w-full"
            min={1}
            required
          />
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Agregar Grupo
        </button>
      </form>

      <h2 className="text-lg font-semibold mb-2">Grupos Registrados ({grupos.length})</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Curso</th>
            <th className="border p-2">Semestre</th>
            <th className="border p-2">Grupo</th>
          </tr>
        </thead>
        <tbody>
          {grupos.map((grupo) => (
            <tr key={grupo.idGrupo}>
              <td className="border p-2">
                {grupo.codigoCurso} - {grupo.curso?.nombreCurso}
              </td>
              <td className="border p-2">
                {grupo.semestre?.año} - {grupo.semestre?.periodo}
              </td>
              <td className="border p-2">{grupo.numeroGrupo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CargaGrupos;
