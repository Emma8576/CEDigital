import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Definir un tipo para agrupar las evaluaciones por rubro
interface EvaluacionesPorRubro {
    [key: string]: {
        rubroId?: number;
        rubroNombre: string;
        rubroPorcentaje?: number; // Porcentaje del rubro sobre el total del curso
        evaluaciones: Evaluacion[];
    };
}

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
    fechaHoraLimite: string;
    valorPorcentual: number;
    esGrupal: boolean;
    tieneEntregable: boolean;
    cantEstudiantesGrupo: number;
    rutaEspecificacion?: string;
    idRubroNavigation?: Rubro;
}

// Rename Entrega interface to EntregaDto
interface EntregaDto {
    idEntrega: number;
    idEvaluacion: number;
    idGrupoTrabajo?: number;
    carnetEstudiante?: string;
    fechaEntrega: string;
    rutaEntregable: string;
}

interface NotaEvaluacion {
    idNotaEvaluacion: number;
    porcentajeObtenido: number;
    observaciones?: string;
    rutaArchivoDetalles?: string;
    publicada: boolean;
    idEvaluacion: number;
    idGrupoTrabajo: number;
}

// New interface for group member DTO
interface GrupoTrabajoMiembroDto {
    carne: string;
    nombre: string;
}

// New interface for a Rubro with its associated Evaluations
interface RubroWithEvaluations extends Rubro {
    evaluaciones: Evaluacion[];
}

interface StudentEvaluationsProps {
    idGrupo: number;
    user: {
        carne?: string;
        nombre?: string;
    };
}

const StudentEvaluations: React.FC<StudentEvaluationsProps> = ({ idGrupo, user }) => {
    const [evaluations, setEvaluations] = useState<Evaluacion[]>([]);
    const [evaluationsByRubro, setEvaluationsByRubro] = useState<EvaluacionesPorRubro>({});
    const [entregas, setEntregas] = useState<{ [key: number]: EntregaDto }>({});
    const [notas, setNotas] = useState<{ [key: number]: NotaEvaluacion }>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [uploadingFile, setUploadingFile] = useState<number | null>(null);
    const [uploadSuccessMessage, setUploadSuccessMessage] = useState<{ [evaluationId: number]: string | null }>({}); // New state for success messages
    const [expandedEvaluationIds, setExpandedEvaluationIds] = useState<Set<number>>(new Set());
    const [expandedRubroIds, setExpandedRubroIds] = useState<Set<number>>(new Set()); // New state for expanded rubros
    // State can be undefined (not fetched), null (fetched, no group), or array of members
    const [groupMembers, setGroupMembers] = useState<{ [evaluationId: number]: GrupoTrabajoMiembroDto[] | null | undefined }>({});
    const [rubrosWithEvaluations, setRubrosWithEvaluations] = useState<RubroWithEvaluations[]>([]);

    // Calculate total obtained percentage
    const totalObtainedPercentage = Object.values(notas).reduce((sum, nota) => {
        // Only include published notes in the calculation
        if (nota.publicada) {
            return sum + nota.porcentajeObtenido;
        }
        return sum;
    }, 0);

    // Calculate final rounded grade
    const finalRoundedGrade = Math.round(totalObtainedPercentage);

    // Function to toggle the expanded state of an evaluation
    const toggleExpand = (evaluationId: number) => {
        setExpandedEvaluationIds(prevIds => {
            const newIds = new Set(prevIds);
            if (newIds.has(evaluationId)) {
                newIds.delete(evaluationId);
            } else {
                newIds.add(evaluationId);
            }
            return newIds;
        });
    };

    // Function to toggle the expanded state of a rubro
    const toggleRubroExpand = (rubroId: number) => {
        setExpandedRubroIds(prevIds => {
            const newIds = new Set(prevIds);
            if (newIds.has(rubroId)) {
                newIds.delete(rubroId);
            } else {
                newIds.add(rubroId);
            }
            return newIds;
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch all rubros for the group
                const rubrosResponse = await axios.get<Rubro[]>(`http://localhost:5000/api/Rubro/grupo/${idGrupo}`);
                const allRubros = rubrosResponse.data;

                console.log("Rubros API response:", rubrosResponse);
                console.log("All Rubros data:", allRubros);

                // Fetch all evaluations for the group
                try {
                    console.log("Attempting to fetch evaluations for group:", idGrupo);
                    const evaluationsResponse = await axios.get<Evaluacion[]>(`http://localhost:5000/api/Evaluacion/grupo/${idGrupo}`);
                    const allEvaluations = evaluationsResponse.data;

                    console.log("Evaluations API response:", evaluationsResponse);
                    console.log("All Evaluations data:", allEvaluations);

                    // Group evaluations by rubroId
                    const evaluationsByRubroId = allEvaluations.reduce((acc, evaluation) => {
                        if (!acc[evaluation.idRubro]) {
                            acc[evaluation.idRubro] = [];
                        }
                        acc[evaluation.idRubro].push(evaluation);
                        return acc;
                    }, {} as { [key: number]: Evaluacion[] });

                    // Combine rubros with their evaluations
                    const combinedData: RubroWithEvaluations[] = allRubros.map(rubro => ({
                        ...rubro,
                        evaluaciones: evaluationsByRubroId[rubro.idRubro] || []
                    }));

                    console.log("Combined Rubros with Evaluations data:", combinedData);

                    setRubrosWithEvaluations(combinedData);
                    setEvaluations(allEvaluations);
                    setEvaluationsByRubro({});

                    // Only try to fetch deliveries and grades if there are evaluations
                    if (allEvaluations.length > 0) {
                        const entregasMap: { [key: number]: EntregaDto } = {};
                        const notasMap: { [key: number]: NotaEvaluacion } = {};

                        for (const evaluation of allEvaluations) {
                            try {
                                const entregaResponse = await axios.get<EntregaDto>(`http://localhost:5000/api/Entrega/estado/${evaluation.idEvaluacion}/${user.carne}`);
                                entregasMap[evaluation.idEvaluacion] = entregaResponse.data;
                            } catch (err) {
                                // No delivery found, that's okay
                            }

                            try {
                                const notaResponse = await axios.get<NotaEvaluacion[]>(`http://localhost:5000/api/NotaEvaluacion/estudiante/${user.carne}/grupo/${idGrupo}`);
                                const nota = notaResponse.data.find(n => n.idEvaluacion === evaluation.idEvaluacion);
                                if (nota) {
                                    notasMap[evaluation.idEvaluacion] = nota;
                                }
                            } catch (err) {
                                // No grade found, that's okay
                            }
                        }

                        setEntregas(entregasMap);
                        setNotas(notasMap);
                    }
                } catch (err) {
                    console.error("Error fetching evaluations:", err);
                    // If there's an error fetching evaluations, still show the rubros
                    const combinedData: RubroWithEvaluations[] = allRubros.map(rubro => ({
                        ...rubro,
                        evaluaciones: []
                    }));
                    setRubrosWithEvaluations(combinedData);
                    setEvaluations([]);
                }

                setLoading(false);
            } catch (err) {
                console.error("Error fetching data:", err);
                if (axios.isAxiosError(err)) {
                    if (err.response?.status === 404) {
                        setError("No hay evaluaciones o rubros disponibles para este grupo.");
                    } else {
                        setError(`Error fetching data: ${err.message}`);
                    }
                } else {
                    setError("Error al cargar las evaluaciones o rubros.");
                }
                setLoading(false);
            }
        };

        fetchData();
    }, [idGrupo, user.carne]);

    // New useEffect to fetch group members when evaluations are expanded
    useEffect(() => {
        const fetchGroupMembers = async () => {
            if (!user.carne) return; // Ensure carne is available

            // Filter evaluations from the flat list
            const evaluationsToFetchMembersFor = evaluations.filter(
                evaluation => evaluation.esGrupal && expandedEvaluationIds.has(evaluation.idEvaluacion)
            );

            for (const evaluation of evaluationsToFetchMembersFor) {
                // Only fetch if members haven't been fetched for this evaluation yet
                // Only fetch if the state is undefined (not yet attempted)
                if (groupMembers[evaluation.idEvaluacion] === undefined) {
                    try {
                        console.log(`Fetching group members for evaluation ${evaluation.idEvaluacion} and user ${user.carne}`);
                        const membersResponse = await axios.get<GrupoTrabajoMiembroDto[]>(`http://localhost:5000/api/EstudianteGrupo/grupo-trabajo-miembros/${user.carne}/${evaluation.idEvaluacion}`); // Updated return type
                        
                        // Set the state to the array of members. If the array is empty, the render logic will handle it.
                        setGroupMembers(prev => ({
                            ...prev,
                            [evaluation.idEvaluacion]: membersResponse.data.length > 0 ? membersResponse.data : null // Set to null if no members returned
                        }));
                    } catch (err) {
                        console.error(`Error fetching group members for evaluation ${evaluation.idEvaluacion}:`, err);
                        // Optionally, set an error state for this specific evaluation's members
                        // Set to null on error as well, indicating no members could be loaded
                        setGroupMembers(prev => ({
                            ...prev,
                            [evaluation.idEvaluacion]: null
                        }));
                    }
                } else {
                    // If state is not undefined (already fetched or explicitly null), do nothing
                    console.log(`Group members for evaluation ${evaluation.idEvaluacion} already fetched or determined: ${groupMembers[evaluation.idEvaluacion] === null ? 'No group' : 'Group found'}`);
                }
            }
        };

        fetchGroupMembers();
    }, [expandedEvaluationIds, evaluations, user.carne, groupMembers]); // Depend on expandedEvaluationIds and evaluations

    const handleFileUpload = async (evaluationId: number, file: File) => {
        try {
            if (!user.carne) {
                console.error("Error: Student carne is not available for file upload.");
                // Optionally, show a user-friendly message in the UI
                return; // Stop the upload process
            }

            setUploadingFile(evaluationId);
            // Clear previous success message for this evaluation (no longer needed with state update)
            // setUploadSuccessMessage(prev => ({ ...prev, [evaluationId]: null }));

            const formData = new FormData();
            formData.append('file', file);
            formData.append('idEvaluacion', evaluationId.toString());
            // Add idGrupoTrabajo or carnetEstudiante based on evaluation type
            const evaluation = evaluations.find(e => e.idEvaluacion === evaluationId);
             if (evaluation?.esGrupal) {
                 // For group evaluations, need to find the IdGrupoTrabajo for the current user and evaluation
                 // This might require a new endpoint or fetching all group memberships initially
                 // For simplicity NOW, we'll assume the idGrupo passed to the component IS the IdGrupoTrabajo if esGrupal is true.
                 // TODO: Implement proper fetching of IdGrupoTrabajo for the user/evaluation in a real app.
                 formData.append('idGrupoTrabajo', idGrupo.toString()); // Using idGrupo from props as placeholder
             } else {
                  formData.append('carnetEstudiante', user.carne); // For individual uploads
             }

            const response = await axios.post<EntregaDto>('http://localhost:5000/api/Entrega', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Update the deliveries state with the new/updated delivery
            setEntregas(prevEntregas => ({
                ...prevEntregas,
                [evaluationId]: response.data // Assuming response.data is the saved/updated EntregaDto
            }));

            // Temporarily show a success message instead of updating deliveries state (Removed)
            // setUploadSuccessMessage(prev => ({ ...prev, [evaluationId]: response.data.message }));

            setUploadingFile(null);

            // You might want to refetch deliveries here after a successful upload
            // to reflect the new state if the backend were fully functional.
            // For now, we just show a success message.

        } catch (err) {
            console.error("Error uploading file:", err);
            setUploadingFile(null);
            // You might want to show an error message to the user here
        }
    };

    // New function to handle delivery deletion
    const handleDeleteDelivery = async (evaluationId: number, entregaId: number) => {
        try {
            // Optional: Add a confirmation dialog here
            const confirmDelete = window.confirm("¿Estás seguro de que quieres eliminar esta entrega?");
            if (!confirmDelete) return;

            await axios.delete(`http://localhost:5000/api/Entrega/${entregaId}`);

            // Remove the deleted delivery from the state
            setEntregas(prevEntregas => {
                const newEntregas = { ...prevEntregas };
                delete newEntregas[evaluationId];
                return newEntregas;
            });

            console.log(`Entrega ${entregaId} eliminada exitosamente.`);
            // Optional: Show a success message to the user

        } catch (err) {
            console.error(`Error deleting delivery ${entregaId}:`, err);
            // Optional: Show an error message to the user
        }
    };

    const handleFileDownload = async (evaluationId: number) => {
        try {
            const entregaActual = entregas[evaluationId];
            if (!entregaActual) return;

            const response = await axios.get(`http://localhost:5000/api/Entrega/descargar/${entregaActual.idEntrega}`, {
                responseType: 'blob'
            });

            // Create a download link and trigger it
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            // Use the actual file name from the backend response
            link.setAttribute('download', entregaActual.rutaEntregable); // Use the correct filename
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Error downloading file:", err);
            // You might want to show an error message to the user here
        }
    };

    if (loading) {
        return <div className="text-center mt-4 text-gray-600">Cargando evaluaciones...</div>;
    }

    if (error) {
        return <div className="text-center mt-4 text-red-600">Error: {error}</div>;
    }

    // Check if there are any rubros or evaluations after loading
    if (rubrosWithEvaluations.length === 0 && !loading) {
        return <div className="text-center mt-4 text-gray-500">No hay evaluaciones disponibles para este grupo.</div>;
    }

    return (
        <div className="space-y-6">
            {/* Student Name and Final Grade - Placeholder */}
            <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center">
                    {/* Placeholder Icon */}
                    <svg className="w-10 h-10 text-gray-500 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
                    <div>
                        {/* Use user.carnet as placeholder, replace with name if available */}
                        <h3 className="text-xl font-semibold text-gray-800">{user.nombre || user.carne}</h3>
                    </div>
                </div>
                {/* Placeholder for Final Grade */}
                <div className="text-xl font-bold text-gray-800">{finalRoundedGrade} / 100</div>
            </div>

            {/* Evaluaciones grouped by Rubro */}
            {rubrosWithEvaluations.map((rubro) => (
                <div key={rubro.idRubro} className="bg-white rounded-lg shadow overflow-hidden">
                    {/* Rubro Header */}
                    <div className="flex items-center justify-between bg-gray-200 px-4 py-3 cursor-pointer" onClick={() => toggleRubroExpand(rubro.idRubro)}>
                        <h4 className="text-lg font-semibold text-gray-700">{rubro.nombreRubro}</h4>
                        {/* Container for Percentage and Icon */} 
                        <div className="flex items-center space-x-3">
                           <div className="text-gray-700">{rubro.porcentaje}%</div>
                            {/* Expand/Collapse Icon for Rubro */} 
                           <button
                                onClick={(e) => { e.stopPropagation(); toggleRubroExpand(rubro.idRubro); }}
                                 className="text-gray-500 hover:text-gray-700 transform transition-transform"
                            >
                                <svg className={`w-5 h-5 ${expandedRubroIds.has(rubro.idRubro) ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                           </button>
                        </div>
                    </div>

                    {/* Evaluaciones List for this Rubro - Show if Rubro is expanded */} {/* Use rubro.idRubro for expanded check */} 
                    {expandedRubroIds.has(rubro.idRubro) && (
                        <ul className="divide-y divide-gray-200">
                            {rubro.evaluaciones.length === 0 ? (
                                // Message if no evaluations for this rubro
                                <li className="px-4 py-3 text-center text-gray-500">No hay evaluaciones para este rubro.</li>
                            ) : (
                                // Map evaluations if they exist
                                rubro.evaluaciones.map((evaluation) => {
                                     const nota = notas[evaluation.idEvaluacion];
                                      // Find the Entrega for this evaluation, considering both individual and group
                                     const entregaActual = entregas[evaluation.idEvaluacion]; // Renamed to avoid conflict

                                    // Determine the grade display based on available data
                                    const gradeDisplay = nota && nota.publicada
                                        ? `${nota.porcentajeObtenido} / ${evaluation.valorPorcentual}%`
                                        : `-- / ${evaluation.valorPorcentual}%`;

                                    // Check if the deadline has passed
                                    const deadlinePassed = new Date() > new Date(evaluation.fechaHoraLimite);

                                    return (
                                        <li key={evaluation.idEvaluacion} className="border-b border-gray-200 last:border-b-0">
                                            <div className="px-4 py-3 flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-gray-700">{evaluation.nombreEvaluacion}</p>
                                                     <p className="text-gray-600 text-sm">Fecha Límite: {new Date(evaluation.fechaHoraLimite).toLocaleDateString()}</p>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                     <span className="text-gray-800 font-semibold">{gradeDisplay}</span>
                                                     {evaluation.tieneEntregable && (
                                                          <button
                                                              onClick={() => toggleExpand(evaluation.idEvaluacion)}
                                                               className="text-gray-500 hover:text-gray-700 transform transition-transform"
                                                          >
                                                               <svg className={`w-5 h-5 ${expandedEvaluationIds.has(evaluation.idEvaluacion) ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                          </button>
                                                     )}
                                                </div>
                                            </div>
                                            {/* Expandable Content for Deliverables and Assignment Details */} {/* Use evaluation.idEvaluacion for expanded check */} 
                                            {expandedEvaluationIds.has(evaluation.idEvaluacion) && (
                                                <div className="px-4 py-3 bg-gray-100 border-t border-gray-200">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {/* Detalles de la asignación Column */}
                                                        <div>
                                                            <p className="font-semibold text-gray-700">Detalles de la asignación:</p>
                                                            <div className="ml-2 mt-2 space-y-1 text-sm text-gray-600">
                                                                {/* Descripción - Placeholder as not in model */}
                                                                <div>
                                                                    <span className="font-medium">Descripción:</span>
                                                                    <span> {/* Placeholder for description text */} N/A</span>
                                                                </div>

                                                                {/* Valor de la Asignación */}                                                                 <div>
                                                                    <span className="font-medium">Valor de la Asignación:</span>
                                                                    <span> {evaluation.valorPorcentual}%</span>
                                                                </div>

                                                                {/* Rúbrica - Placeholder */}                                                                 <div>
                                                                    <span className="font-medium">Rúbrica:</span>
                                                                    <span> {/* Placeholder for rubric status (Si/No) */} N/A</span>
                                                                </div>

                                                                {/* Fecha de Entrega */}                                                                 <div>
                                                                    <span className="font-medium">Fecha de Entrega:</span>
                                                                    <span> {new Date(evaluation.fechaHoraLimite).toLocaleString()}</span>
                                                                </div>

                                                                {/* Posibilidad de entregar después de fecha límite - Placeholder */}                                                                 <div>
                                                                    <span className="font-medium">Posibilidad de entregar después de fecha límite:</span>
                                                                    <span> {/* Placeholder for status (Si/No) */} N/A</span>
                                                                </div>

                                                                {/* Información de Grupo si es Grupal */}                                                                 {evaluation.esGrupal && (
                                                                    <div>
                                                                        <span className="font-medium">Cantidad de personas por grupo:</span>
                                                                        <span> {evaluation.cantEstudiantesGrupo}</span>
                                                                        {/* Miembros del grupo */} {/* Use groupMembers state */} 
                                                                        <div className="mt-2">
                                                                            <p className="font-medium">Miembros del grupo:</p>
                                                                            <ul className="list-disc list-inside ml-4">
                                                                                {/* Map group members here */} 
                                                                                {/* Conditional rendering based on groupMembers state */} 
                                                                                {groupMembers[evaluation.idEvaluacion] === undefined ? (
                                                                                    <li>Cargando miembros...</li> // Still loading
                                                                                ) : groupMembers[evaluation.idEvaluacion] === null ? (
                                                                                    <li>Usted no se encuentra en un grupo de trabajo para esta evaluación.</li> // No group found
                                                                                ) : (groupMembers[evaluation.idEvaluacion]?.length ?? 0) > 0 ? (
                                                                                    // Display members if the array is not null and has elements
                                                                                    (groupMembers[evaluation.idEvaluacion] as GrupoTrabajoMiembroDto[]).map(member => (
                                                                                         <li key={member.carne}>{member.nombre}</li>
                                                                                     ))
                                                                                ) : (
                                                                                    // Fallback, theoretically should not happen with the null check, but good practice
                                                                                    <li>No hay información de miembros disponible.</li>
                                                                                )}
                                                                            </ul>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Especificación - Moved here */}                                                                 {evaluation.rutaEspecificacion && (
                                                                    <div className="mt-2">
                                                                        <a
                                                                            href={evaluation.rutaEspecificacion}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-blue-600 hover:underline"
                                                                        >
                                                                            Ver Especificación
                                                                        </a>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Mis entregas Column */}                                                         <div>
                                                            <p className="font-semibold text-gray-700">Mis entregas:</p>
                                                            <div className="ml-2 mt-2 space-y-2 text-sm">
                                                                {/* Upload/Download area */}                                                                 {evaluation.tieneEntregable && (
                                                                    <div>
                                                                         {entregaActual ? (
                                                                            // If there is a delivery
                                                                            <div className="space-y-2">
                                                                                <div>
                                                                                    <span className="font-medium text-green-600">Estado:</span>
                                                                                    <span className="text-gray-700 ml-1">Entregado</span>
                                                                                </div>
                                                                                <div>
                                                                                    <span className="font-medium text-gray-700">Fecha de Entrega:</span>
                                                                                    <span className="text-gray-700 ml-1">{new Date(entregaActual.fechaEntrega).toLocaleString()}</span>
                                                                                </div>
                                                                                <button
                                                                                    onClick={() => handleFileDownload(evaluation.idEvaluacion)}
                                                                                    className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                                                                                >
                                                                                    Descargar Entregable
                                                                                </button>
                                                                            </div>
                                                                        ) : ( /* No delivery */
                                                                            // Check if the evaluation date limit has passed
                                                                            deadlinePassed ? (
                                                                                // If no delivery and past due
                                                                                <p className="text-red-600">Entrega no realizada. La fecha límite ha pasado.</p>
                                                                            ) : (
                                                                                <div className="space-y-2">
                                                                                     <p className="text-yellow-700 font-medium">Estado: Pendiente de entrega.</p>
                                                                                    {/* File Upload Area */} 
                                                                                     <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                                                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                                                            <svg className="w-8 h-8 mb-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                                                                            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click para subir</span> o arrastra y suelta</p>
                                                                                            <p className="text-xs text-gray-500">(MAX: 80MB - Tipos de archivo permitidos...)</p>
                                                                                        </div>
                                                                                        <input
                                                                                            type="file"
                                                                                            className="hidden"
                                                                                            onChange={(e) => {
                                                                                                const file = e.target.files?.[0];
                                                                                                if (file) handleFileUpload(evaluation.idEvaluacion, file);
                                                                                            }}
                                                                                            disabled={uploadingFile === evaluation.idEvaluacion}
                                                                                        />
                                                                                    </label>
                                                                                    {uploadingFile === evaluation.idEvaluacion && (
                                                                                        <span className="ml-2 text-gray-600 text-sm">Subiendo...</span>
                                                                                    )}
                                                                                </div>
                                                                            )
                                                                        )}

                                                                         {/* Eliminar Entrega button - Show only if delivery exists and deadline has not passed */}                                                                         {entregaActual && !deadlinePassed && (
                                                                             <button
                                                                                 onClick={() => handleDeleteDelivery(evaluation.idEvaluacion, entregaActual.idEntrega)}
                                                                                 className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 mt-2"
                                                                             >
                                                                                 Eliminar Entrega
                                                                             </button>
                                                                         )}
                                                                    </div>
                                                                )}

                                                         {/* Nota obtenida */}                                                              <div className="mt-4">
                                                                    <span className="font-medium text-gray-700">Nota obtenida:</span>
                                                                    {/* Show obtained grade if available, otherwise -- */}                                                                    <span className="text-gray-800 ml-1">{nota && nota.publicada ? nota.porcentajeObtenido : '--'} / {evaluation.valorPorcentual}%</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* Optional: Add Observations here if they are linked to the grade */}                                                     {nota && nota.observaciones && (
                                                        <div className="mt-4 text-sm text-gray-600">
                                                            <p className="font-medium">Observaciones:</p>
                                                            <p>{nota.observaciones}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </li>
                                    );
                                })
                            )}
                        </ul>
                    )}
                </div>
            ))}

            {/* Nota Total and Nota Final - Placeholder */}
            <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold text-gray-800">
                    <span>Nota Total (sin redondear)</span>
                    {/* Display calculated total obtained percentage */}
                    <span>{totalObtainedPercentage.toFixed(2)} / 100</span>
                </div>
                <div className="flex justify-between items-center text-xl font-bold text-gray-800">
                    <span>Nota final</span>
                    {/* Display rounded final grade */}
                    <span>{finalRoundedGrade} / 100</span>
                </div>
            </div>
        </div>
    );
};

export default StudentEvaluations; 