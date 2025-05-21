import { useEffect, useState } from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { obtenerSemestres, crearSemestre, eliminarSemestre,obtenerSemestreCantidadGrupos } from "../services/semestreService"; // Ajusta ruta si es necesario
import FormularioAgregarGrupo from "./AgregarGrupo";
type Semestre = {
  idSemestre: number;
  año: number;
  periodo: string;
  cantidadGrupos: number;
};

const GestionSemestres = () => {
  const [semestres, setSemestres] = useState<Semestre[]>([]);
  const [mostrarFormularioSemestre, setMostrarFormularioSemestre] = useState(false);
  const [nuevoSemestre, setNuevoSemestre] = useState({ año: new Date().getFullYear(), periodo: "1" });
const [mostrarFormularioGrupo, setMostrarFormularioGrupo] = useState(false);
const [semestreSeleccionado, setSemestreSeleccionado] = useState<number | null>(null);

//Cada semestre muestra sus datos y la cantidad de grupos
useEffect(() => {
  obtenerSemestres()
    .then(async response => {
      const listaSemestres = response.data;
      const semestresConGrupos = await Promise.all(
        listaSemestres.map(async (sem: Semestre) => {
          try {
            const resp = await obtenerSemestreCantidadGrupos(sem.idSemestre);
            return {
              ...sem,
              cantidadGrupos: resp.data.cantidadGrupos ?? 0,
            };
            //Si hay un error se muestra 0 en Grupos Activos
          } catch (error) {
            console.error(`Error al obtener cantidad de grupos para semestre ${sem.idSemestre}`, error);
            return { ...sem, cantidadGrupos: 0 }; // fallback
          }
        })
      );

      setSemestres(semestresConGrupos);
    })
    .catch(error => console.error("Error al obtener semestres:", error));
}, []);

/*
  useEffect(() => {
    obtenerSemestres()
      .then(response => setSemestres(response.data))
      .catch(error => console.error("Error al obtener semestres:", error));
  }, []);
*/
  const periodos = [
    { valor: "1", nombre: "1 - Primer Semestre" },
    { valor: "2", nombre: "2 - Segundo Semestre" },
    { valor: "V", nombre: "V - Verano" },
  ];

  const handleAgregarSemestre = () => {
    crearSemestre(nuevoSemestre)
      .then(response => {
        setSemestres([...semestres, response.data]);
        setNuevoSemestre({ año: new Date().getFullYear(), periodo: "1" });
        setMostrarFormularioSemestre(false);
      })
      .catch(error => console.error("Error al agregar semestre:", error));
  };

const handleEliminarSemestre = (id: number) => {
  eliminarSemestre(id)
    .then(() => {
      setSemestres(semestres.filter(s => s.idSemestre !== id));
    })
    .catch(error => {
      const mensaje = error.response?.data || "Error al eliminar semestre.";
      alert(mensaje);
    });
};

    const handleAgregarCursos = (idSemestre: number) => {
      // Por ahora solo imprime en consola. Luego puedes conectar a un modal o navegación.
      console.log(`Agregar cursos al semestre con ID: ${idSemestre}`);
    };
  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-900">Gestión de Semestres</h1>
        <button
          onClick={() => setMostrarFormularioSemestre(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <PlusIcon className="w-5 h-5" />
          Crear Semestre
        </button>
      </div>

      {/* Descripción */}
      <div className="text-gray-700">
        En esta sección puede crear semestres con su respectivo año y periodo académico.
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-xl">
          <thead>
            <tr className="bg-blue-100 text-left">
              <th className="p-3">Año</th>
              <th className="p-3">Periodo</th>
              <th className="p-3">Grupos Activos</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {semestres.map((sem) => (
              <tr key={sem.idSemestre} className="border-t">
                <td className="p-3">{sem.año}</td>
                <td className="p-3">{sem.periodo}</td>
                <td className="p-3">{sem.cantidadGrupos ?? 0}</td>
                <td className="p-3 flex gap-2">
                  <button 
                    onClick={() => handleEliminarSemestre(sem.idSemestre)}
                    className="bg-red-600 text-white p-1 rounded hover:bg-red-700"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {semestres.length === 0 && (
              <tr>
                <td colSpan={3} className="p-3 text-center text-gray-500">
                  No hay semestres registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Formulario */}
      {mostrarFormularioSemestre && (
        <div className="bg-gray-100 p-6 rounded-lg shadow-md space-y-4">
          <h2 className="text-lg font-bold text-gray-800">Nuevo Semestre</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="mb-1 text-sm text-gray-600">Año</label>
              <input
                type="number"
                className="p-2 border rounded"
                value={nuevoSemestre.año}
                onChange={(e) => setNuevoSemestre({ ...nuevoSemestre, año: parseInt(e.target.value) })}
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-sm text-gray-600">Periodo</label>
              <select
                className="p-2 border rounded"
                value={nuevoSemestre.periodo}
                onChange={(e) => setNuevoSemestre({ ...nuevoSemestre, periodo: e.target.value })}
              >
                {periodos.map((p) => (
                  <option key={p.valor} value={p.valor}>{p.nombre}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAgregarSemestre}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Guardar
            </button>
            <button
              onClick={() => setMostrarFormularioSemestre(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancelar
            </button>
            {mostrarFormularioGrupo && semestreSeleccionado !== null && (
            <FormularioAgregarGrupo
            idSemestre={semestreSeleccionado}
            onClose={() => setMostrarFormularioGrupo(false)}
            onGrupoCreado={() => {
              // Lógica para actualizar la lista de semestres o grupos si es necesario
            }}
          />
        )}
          </div>
        </div>
      )}
    </div>
    
  );
};

export default GestionSemestres;
