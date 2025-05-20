import { useState, useEffect } from "react";
import axios from "axios";

type Curso = {
  codigoCurso: string;
  nombreCurso: string;
};

type Grupo = {
  idGrupo: number;
  codigoCurso: string;
  idSemestre: number;
  numeroGrupo: number;
};

type GrupoCreateDto = {
  codigoCurso: string;
  idSemestre: number;
  numeroGrupo: number;
};

type Props = {
  idSemestre: number;
  onClose: () => void;
  onGrupoCreado: () => void;
};

const AgregarGrupo = ({ idSemestre, onClose, onGrupoCreado }: Props) => {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [filtro, setFiltro] = useState("");
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [numeroGrupo, setNumeroGrupo] = useState(1);
  const [gruposExistentes, setGruposExistentes] = useState<Grupo[]>([]);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    // Obtener la lista de cursos desde la API
    axios
      .get("/api/Curso")
      .then((response) => setCursos(response.data))
      .catch((error) => console.error("Error al obtener cursos:", error));
  }, []);

  useEffect(() => {
    if (cursoSeleccionado) {
      // Obtener los grupos existentes para el curso y semestre seleccionados
      axios
        .get("/api/Grupo")
        .then((response) => {
          const gruposFiltrados = response.data.filter(
            (grupo: Grupo) =>
              grupo.codigoCurso === cursoSeleccionado &&
              grupo.idSemestre === idSemestre
          );
          setGruposExistentes(gruposFiltrados);
        })
        .catch((error) =>
          console.error("Error al obtener grupos existentes:", error)
        );
    } else {
      setGruposExistentes([]);
    }
  }, [cursoSeleccionado, idSemestre]);

  const cursosFiltrados = cursos.filter(
    (curso) =>
      curso.nombreCurso.toLowerCase().includes(filtro.toLowerCase()) ||
      curso.codigoCurso.toLowerCase().includes(filtro.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const grupoExistente = gruposExistentes.find(
      (grupo) => grupo.numeroGrupo === numeroGrupo
    );
    if (grupoExistente) {
      setMensaje(
        `El grupo número ${numeroGrupo} ya existe para este curso y semestre.`
      );
      return;
    }

    const nuevoGrupo: GrupoCreateDto = {
      codigoCurso: cursoSeleccionado,
      idSemestre,
      numeroGrupo,
    };

    axios
      .post("/api/Grupo", nuevoGrupo)
      .then(() => {
        onGrupoCreado();
        onClose();
      })
      .catch((error) => {
        console.error("Error al crear grupo:", error);
        setMensaje("Error al crear el grupo. Intente nuevamente.");
      });
  };

  return (
    <div className="bg-white p-6 rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">Agregar Curso al Semestre</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Buscar Curso
          </label>
          <input
            type="text"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="Ingrese nombre o código del curso"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Seleccionar Curso
          </label>
          <select
            value={cursoSeleccionado}
            onChange={(e) => setCursoSeleccionado(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          >
            <option value="">-- Seleccione un curso --</option>
            {cursosFiltrados.map((curso) => (
              <option key={curso.codigoCurso} value={curso.codigoCurso}>
                {curso.codigoCurso} - {curso.nombreCurso}
              </option>
            ))}
          </select>
        </div>
        {gruposExistentes.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Grupos Existentes
            </label>
            <ul className="list-disc list-inside">
              {gruposExistentes.map((grupo) => (
                <li key={grupo.idGrupo}>Grupo {grupo.numeroGrupo}</li>
              ))}
            </ul>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Número de Grupo
          </label>
          <input
            type="number"
            value={numeroGrupo}
            onChange={(e) => setNumeroGrupo(parseInt(e.target.value))}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            min={1}
            required
          />
        </div>
        {mensaje && <p className="text-red-500">{mensaje}</p>}
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
};

export default AgregarGrupo;
