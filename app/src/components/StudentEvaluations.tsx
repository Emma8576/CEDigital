import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Define interfaces based on the backend Evaluacion model/DTO
interface Rubro {
    idRubro: number;
    nombreRubro: string;
    porcentaje: number;
}

interface Evaluacion {
    idEvaluacion: number;
    idRubro: number;
    nombreEvaluacion: string;
    fechaHoraLimite: string; // Or Date if parsed
    valorPorcentual: number;
    esGrupal: boolean;
    tieneEntregable: boolean;
    cantEstudiantesGrupo: number;
    rutaEspecificacion?: string; // Optional
    idRubroNavigation?: Rubro; // Include Rubro details if available
}

interface StudentEvaluationsProps {
  idGrupo: number;
}

const StudentEvaluations: React.FC<StudentEvaluationsProps> = ({ idGrupo }) => {
  const [evaluations, setEvaluations] = useState<Evaluacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        setLoading(true);
        // Use the backend endpoint to fetch evaluations by group ID
        const response = await axios.get<Evaluacion[]>(`http://localhost:5261/api/Evaluacion/grupo/${idGrupo}`);
        setEvaluations(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching evaluations:", err);
        // Handle 404 specifically if no evaluations are found
        if (axios.isAxiosError(err) && err.response?.status === 404) {
             setError("No hay evaluaciones disponibles para este grupo.");
        } else {
            setError("Error al cargar las evaluaciones.");
        }
        setLoading(false);
      }
    };

    fetchEvaluations();
  }, [idGrupo]); // Re-fetch evaluations if idGrupo changes

  if (loading) {
    return <div className="text-center mt-4 text-gray-600">Cargando evaluaciones...</div>;
  }

  if (error) {
    return <div className="text-center mt-4 text-red-600">Error: {error}</div>;
  }

  if (evaluations.length === 0 && !error) {
       return <div className="text-center mt-4 text-gray-500">No hay evaluaciones disponibles para este grupo.</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-700">Evaluaciones del Grupo</h3>
      {evaluations.map((evaluation) => (
        <div key={evaluation.idEvaluacion} className="bg-white rounded-lg shadow p-4">
          <h4 className="text-md font-semibold text-gray-800">{evaluation.nombreEvaluacion}</h4>
          <p className="text-gray-600 text-sm">Rubro: {evaluation.idRubroNavigation?.nombreRubro || 'N/A'}</p>
          <p className="text-gray-600 text-sm">Valor: {evaluation.valorPorcentual}%</p>
          <p className="text-gray-600 text-sm">Fecha Límite: {new Date(evaluation.fechaHoraLimite).toLocaleString()}</p>
          <p className="text-gray-600 text-sm">Tipo: {evaluation.esGrupal ? 'Grupal' : 'Individual'}</p>

          {/* TODO: Add upload and download buttons based on evaluation.tieneEntregable */}
           {evaluation.tieneEntregable && (
               <div className="mt-3">
                   <p className="text-gray-700 text-sm">Esta evaluacin requiere un entregable.</p>
                    {/* Placeholder for upload/download functionality */}
                     <button className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 mr-2">Subir Entregable</button>
                     <button className="mt-2 bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600">Descargar Entregable</button>
               </div>
           )}

          {/* Optional: Link to specification if available */}
          {evaluation.rutaEspecificacion && (
            <div className="mt-3">
                <a 
                    href={evaluation.rutaEspecificacion} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:underline text-sm"
                >
                    Ver Especificacin
                </a>
            </div>
          )}

        </div>
      ))}
    </div>
  );
};

export default StudentEvaluations; 