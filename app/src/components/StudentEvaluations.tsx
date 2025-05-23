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
    const [groupMembers, setGroupMembers] = useState<{ [evaluationId: number]: GrupoTrabajoMiembroDto[] }>({}); // Updated state type

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch evaluations (now returning a projected object structure)
                const evaluationsResponse = await axios.get<any[]>(`http://localhost:5261/api/Evaluacion/grupo/${idGrupo}`);
                // Process the data to group by rubro and adapt to the frontend interfaces
                const processedEvaluations: Evaluacion[] = evaluationsResponse.data.map((item: any) => ({
                    idEvaluacion: item.idEvaluacion,
                    idRubro: item.idRubro,
                    nombreEvaluacion: item.nombreEvaluacion,
                    fechaHoraLimite: item.fechaHoraLimite,
                    valorPorcentual: item.valorPorcentual, // Now decimal due to backend config
                    esGrupal: item.esGrupal,
                    tieneEntregable: item.tieneEntregable,
                    cantEstudiantesGrupo: item.cantEstudiantesGrupo,
                    rutaEspecificacion: item.rutaEspecificacion,
                    idRubroNavigation: {
                         idRubro: item.idRubroNavigation?.idRubro, // Access from idRubroNavigation (corrected casing)
                         nombreRubro: item.idRubroNavigation?.nombreRubro, // Access from idRubroNavigation (corrected casing)
                         porcentaje: item.idRubroNavigation?.porcentaje // Access from idRubroNavigation (corrected casing)
                    }
                }));

                // Group evaluations by rubro name
                const grouped = processedEvaluations.reduce((acc, evaluation) => {
                    const rubroNombre = evaluation.idRubroNavigation?.nombreRubro || 'Sin Rubro';
                    if (!acc[rubroNombre]) {
                        acc[rubroNombre] = {
                            rubroId: evaluation.idRubro,
                            rubroNombre: rubroNombre,
                            rubroPorcentaje: evaluation.idRubroNavigation?.porcentaje, // Store rubro's total percentage
                            evaluaciones: [],
                        };
                    }
                    acc[rubroNombre].evaluaciones.push(evaluation);
                    return acc;
                }, {} as EvaluacionesPorRubro);

                console.log("Grouped Evaluations:", grouped);
                console.log("Processed Evaluations:", processedEvaluations);

                setEvaluationsByRubro(grouped);
                setEvaluations(processedEvaluations); // Keep flat list for easier iteration if needed

                // Fetch deliveries and grades for each evaluation
                const entregasMap: { [key: number]: EntregaDto } = {};
                const notasMap: { [key: number]: NotaEvaluacion } = {};

                for (const evaluation of processedEvaluations) {
                    try {
                        // Fetch delivery status
                        const entregaResponse = await axios.get<EntregaDto>(`http://localhost:5261/api/Entrega/estado/${evaluation.idEvaluacion}/${user.carne}`);
                        entregasMap[evaluation.idEvaluacion] = entregaResponse.data;
                    } catch (err) {
                        // No delivery found, that's okay
                    }

                    try {
                        // Fetch grade
                        const notaResponse = await axios.get<NotaEvaluacion[]>(`http://localhost:5261/api/NotaEvaluacion/estudiante/${user.carne}/grupo/${idGrupo}`);
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
                setLoading(false);
            } catch (err) {
                console.error("Error fetching data:", err);
                if (axios.isAxiosError(err) && err.response?.status === 404) {
                    setError("No hay evaluaciones o notas disponibles para este grupo.");
                } else {
                    setError("Error al cargar las evaluaciones.");
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

            const evaluationsToFetchMembersFor = evaluations.filter(
                evaluation => evaluation.esGrupal && expandedEvaluationIds.has(evaluation.idEvaluacion)
            );

            for (const evaluation of evaluationsToFetchMembersFor) {
                // Only fetch if members haven't been fetched for this evaluation yet
                if (!groupMembers[evaluation.idEvaluacion]) {
                    try {
                        const membersResponse = await axios.get<GrupoTrabajoMiembroDto[]>(`http://localhost:5261/api/EstudianteGrupo/grupo-trabajo-miembros/${user.carne}/${evaluation.idEvaluacion}`); // Updated return type
                        setGroupMembers(prev => ({
                            ...prev,
                            [evaluation.idEvaluacion]: membersResponse.data
                        }));
                    } catch (err) {
                        console.error(`Error fetching group members for evaluation ${evaluation.idEvaluacion}:`, err);
                        // Optionally, set an error state for this specific evaluation's members
                    }
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

            const response = await axios.post<EntregaDto>('http://localhost:5261/api/Entrega', formData, {
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

            await axios.delete(`http://localhost:5261/api/Entrega/${entregaId}`);

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

            const response = await axios.get(`http://localhost:5261/api/Entrega/descargar/${entregaActual.idEntrega}`, {
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
    if (Object.keys(evaluationsByRubro).length === 0 && !loading) {
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
            {Object.entries(evaluationsByRubro).map(([rubroNombre, rubroData]) => (
                <div key={rubroNombre} className="bg-white rounded-lg shadow overflow-hidden">
                    {/* Rubro Header */}
                    <div className="flex items-center justify-between bg-gray-200 px-4 py-3">
                        <h4 className="text-lg font-semibold text-gray-700">{rubroNombre}</h4>
                        {/* Display Rubro's total percentage/points */}
                        <div className="text-gray-700">{rubroData.rubroPorcentaje}%</div>
                         {/* Placeholder for Add/Remove Rubro if needed - Use the existing icon styles */}
                         {/* <button className="text-gray-500 hover:text-gray-700"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></button> */}
                         {/* Placeholder for Expand/Collapse Rubro if needed - Use the existing icon styles */}
                         {/* <button className="text-gray-500 hover:text-gray-700"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z"></path></svg></button> */}
                    </div>

                    {/* Evaluaciones List for this Rubro */}
                    <ul className="divide-y divide-gray-200">
                        {rubroData.evaluaciones.map((evaluation) => {
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
                                            {/* Optional: Due date, type, etc. */}
                                             <p className="text-gray-600 text-sm">Fecha Límite: {new Date(evaluation.fechaHoraLimite).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            {/* Grade Display */}
                                             <span className="text-gray-800 font-semibold">{gradeDisplay}</span>

                                            {/* Deliverables Dropdown/Button */}
                                             {evaluation.tieneEntregable && (
                                                  <button
                                                      onClick={() => toggleExpand(evaluation.idEvaluacion)}
                                                       className="text-gray-500 hover:text-gray-700 transform transition-transform"
                                                  >
                                                      {/* Icon changes based on expanded state */}
                                                       <svg className={`w-5 h-5 ${expandedEvaluationIds.has(evaluation.idEvaluacion) ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                  </button>
                                             )}
                                        </div>
                                    </div>
                                    {/* Expandable Content for Deliverables and Assignment Details */}
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
                                                            {/* Ver archivo adjunto - Placeholder based on image */}
                                                            {/* <a href="#" className="text-blue-600 hover:underline ml-2">Ver archivo adjunto</a> */}
                                                        </div>

                                                        {/* Valor de la Asignación */}                                                         <div>
                                                            <span className="font-medium">Valor de la Asignación:</span>
                                                            <span> {evaluation.valorPorcentual}%</span> {/* Assuming ValorPorcentual is the weight in the rubro */}                                                         </div>

                                                        {/* Rúbrica - Placeholder */}                                                         <div>
                                                            <span className="font-medium">Rúbrica:</span>
                                                            <span> {/* Placeholder for rubric status (Si/No) */} N/A</span>
                                                        </div>

                                                        {/* Fecha de Entrega */}                                                         <div>
                                                            <span className="font-medium">Fecha de Entrega:</span>
                                                            <span> {new Date(evaluation.fechaHoraLimite).toLocaleString()}</span>
                                                        </div>

                                                        {/* Posibilidad de entregar después de fecha límite - Placeholder */}
                                                        <div>
                                                            <span className="font-medium">Posibilidad de entregar después de fecha límite:</span>
                                                            <span> {/* Placeholder for status (Si/No) */} N/A</span>
                                                        </div>

                                                        {/* Información de Grupo si es Grupal */}                                                         {evaluation.esGrupal && (
                                                            <div>
                                                                <span className="font-medium">Cantidad de personas por grupo:</span>
                                                                <span> {evaluation.cantEstudiantesGrupo}</span>
                                                                {/* Miembros del grupo - Placeholder as data is not fetched */}
                                                                <div className="mt-2">
                                                                    <p className="font-medium">Miembros del grupo:</p>
                                                                    <ul className="list-disc list-inside ml-4">
                                                                        {/* Map group members here when data is available */}
                                                                        {groupMembers[evaluation.idEvaluacion]?.length > 0 ? (
                                                                            groupMembers[evaluation.idEvaluacion].map(member => ( // Iterate over GrupoTrabajoMiembroDto objects
                                                                                <li key={member.carne}>{member.nombre}</li> // Use carne for key and display nombre
                                                                            ))
                                                                        ) : (
                                                                            <li>Cargando miembros...</li>
                                                                        )}
                                                                        {/* Example: {groupMembers.map(member => <li key={member.id}>{member.name}</li>)} */}
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Especificación - Moved here */}                                                         {evaluation.rutaEspecificacion && (
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

                                                {/* Mis entregas Column */}
                                                <div>
                                                    <p className="font-semibold text-gray-700">Mis entregas:</p>
                                                    <div className="ml-2 mt-2 space-y-2 text-sm">
                                                        {/* Upload/Download area */}
                                                        {evaluation.tieneEntregable && ( /* Only show if deliverable is required */
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
                                                                        {/* Optional: Show who submitted in case of group evaluation */}
                                                                        {/* {evaluation.esGrupal && entrega.carnetEstudiante && <span className="text-gray-600 text-xs">Entregado por: {entrega.carnetEstudiante}</span>} */}
                                                                    </div>
                                                                ) : ( /* No delivery */
                                                                    // Check if the evaluation date limit has passed
                                                                    deadlinePassed ? (
                                                                        // If no delivery and past due
                                                                        <p className="text-red-600">Entrega no realizada. La fecha límite ha pasado.</p>
                                                                    ) : ( // If no delivery and not past due
                                                                        <div className="space-y-2">
                                                                             <p className="text-yellow-700 font-medium">Estado: Pendiente de entrega.</p>
                                                                            {/* File Upload Area - Simplified for now */}
                                                                             <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                                                    <svg className="w-8 h-8 mb-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                                                                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click para subir</span> o arrastra y suelta</p>
                                                                                    <p className="text-xs text-gray-500">(MAX: 80MB - Tipos de archivo permitidos...)</p> {/* TODO: Add allowed file types */}                                                                                </div>
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
                                                                            {/* Display success message */}
                                                                             {/* {uploadSuccessMessage[evaluation.idEvaluacion] && (
                                                                                <span className="ml-2 text-green-600 text-sm">{uploadSuccessMessage[evaluation.idEvaluacion]}</span>
                                                                             )} */}
                                                                            {/* Optional: Entrega mediante Enlace (URL) - Placeholder */}
                                                                            {/* <button className="text-blue-600 hover:underline text-sm mt-1">o Entregar mediante un Enlace (URL)</button> */}
                                                                        </div>
                                                                    )
                                                                )}

                                                                 {/* Eliminar Entrega button - Show only if delivery exists and deadline has not passed */}
                                                                 {entregaActual && !deadlinePassed && (
                                                                     <button
                                                                         onClick={() => handleDeleteDelivery(evaluation.idEvaluacion, entregaActual.idEntrega)}
                                                                         className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 mt-2"
                                                                     >
                                                                         Eliminar Entrega
                                                                     </button>
                                                                 )}
                                                            </div>
                                                        )}

                                                         {/* Nota obtenida */}                                                         <div className="mt-4">
                                                            <span className="font-medium text-gray-700">Nota obtenida:</span>
                                                             {/* Show obtained grade if available, otherwise -- */}
                                                            <span className="text-gray-800 ml-1">{nota && nota.publicada ? nota.porcentajeObtenido : '--'} / {evaluation.valorPorcentual}%</span> {/* Using ValorPorcentual as total here too */}                                                         </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Optional: Add Observations here if they are linked to the grade */}                                             {nota && nota.observaciones && (
                                                <div className="mt-4 text-sm text-gray-600">
                                                    <p className="font-medium">Observaciones:</p>
                                                    <p>{nota.observaciones}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
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