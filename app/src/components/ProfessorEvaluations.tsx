import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProfessorEvaluations.css';

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

interface Entrega {
    idEntrega: number;
    idEvaluacion: number;
    idGrupoTrabajo?: number;
    carnetEstudiante?: string;
    fechaEntrega: string;
    rutaEntregable: string;
}

interface NotaEvaluacion {
    idEvaluacion: number,
    idRubro: number,
    carnetEstudiante: string,
    nombreEvaluacion: string,
    idNotaEvaluacion: number,
    porcentajeObtenido: number,
    observaciones: string,
    publicada: boolean
}

// New interface for group member DTO
interface GrupoTrabajoMiembroDto {
    carnet: string;
    nombre: string;
}

interface ProfessorEvaluationsProps {
    idGrupo: number;
    user: {
        carnet?: string;
        nombre?: string;
    };
}

function askAmountOfStudents(esGrupal:boolean){
    if(esGrupal){
        return 'block';
    }
    else{
        return 'None';
    }
}

function showThisBlock(shownDiv: number, thisDiv: number, isEdit: boolean){
    if (shownDiv === thisDiv){
        if(isEdit){
            return 'block';   
        }else{
            return 'None';
        }
        
    }else{
        if(isEdit){
            return 'None';   
        }else{
            return 'Block';
        }
    }
}

const ProfessorEvaluations: React.FC<ProfessorEvaluationsProps> = ({ idGrupo, user }) => {
    const port = '5000';
    const [evaluations, setEvaluations] = useState<Evaluacion[]>([]);
    const [evaluationsByRubro, setEvaluationsByRubro] = useState<EvaluacionesPorRubro>({});
    const [entregas, setEntregas] = useState<{ [key: number]: Entrega }>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [uploadingFile, setUploadingFile] = useState<number | null>(null);
    const [uploadSuccessMessage, setUploadSuccessMessage] = useState<{ [evaluationId: number]: string | null }>({}); // New state for success messages
    const [expandedEvaluationIds, setExpandedEvaluationIds] = useState<Set<number>>(new Set());
    const [groupMembers, setGroupMembers] = useState<{ [evaluationId: number]: GrupoTrabajoMiembroDto[] }>({}); // Updated state type

    const [newEvaluationName, setNewEvaluationName] = useState("");
    const [newEvaluationRubroName, setNewEvaluationRubroName] = useState("");
    const [newEvaluationDate, setNewEvaluationDate] = useState('');
    const [newEvaluationRubro, setNewEvaluationRubro] = useState(-1);
    const [newEvaluationPercentage, setNewEvaluationPercentage] = useState(0);
    const [newEvaluationWithGroups, setNewEvaluationsWithGroups] = useState(false);
    const [newEvaluationGroupSize, setNewEvaluationsGroupSize] = useState(1);
    const [newEvaluationhasEntregable, setNewEvaluationsHasEntregable] = useState(false);
    const [newEvaluationTime, setNewEvaluationTime] = useState('23:59');

    const [listaNotasEvaluacion, setListaNotasEvaluacion] = useState<NotaEvaluacion[]>([]);

    const [notaActualizarPublicada, setNotaActualizarPublicada] = useState(false);
    const [notaActualizarValor, setNotaActualizarValor] = useState(0);
    const [notaActualizarObservaciones, setNotaActualizarObservaciones] = useState("");
    const [notaIdIsActualizando, setNotaIdIsActualizando] = useState(-1);


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

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch evaluations (now returning a projected object structure)
            const evaluationsResponse = await axios.get<any[]>(`http://localhost:${port}/api/Evaluacion/grupo/${idGrupo}`);
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
                        idRubro: item.idRubro, // Assuming idRubro is also in the projection
                        nombreRubro: item.idRubroNavigation.nombreRubro, // Use the nested Rubro object
                        porcentaje: item.idRubroNavigation.porcentaje // Assuming porcentaje is in the projection
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
            const entregasMap: { [key: number]: Entrega } = {};
            const notasMap: { [key: number]: NotaEvaluacion } = {};

            for (const evaluation of processedEvaluations) {
                try {
                    // Fetch delivery status
                    const entregaResponse = await axios.get<Entrega>(`http://localhost:${port}/api/Entrega/estado/${evaluation.idEvaluacion}/${user.carnet}`);
                    entregasMap[evaluation.idEvaluacion] = entregaResponse.data;
                } catch (err) {
                    // No delivery found, that's okay
                }

                try {
                    // Fetch grade
                    const notaResponse = await axios.get<NotaEvaluacion[]>(`http://localhost:${port}/api/NotaEvaluacion/estudiante/${user.carnet}/grupo/${idGrupo}`);
                    const nota = notaResponse.data.find(n => n.idEvaluacion === evaluation.idEvaluacion);
                    if (nota) {
                        notasMap[evaluation.idEvaluacion] = nota;
                    }
                } catch (err) {
                    // No grade found, that's okay
                }
            }

            setEntregas(entregasMap);
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

    useEffect(() => {
        fetchData();
    }, [idGrupo, user.carnet]);

    const fetchGroupMembers = async () => {
        if (!user.carnet) return; // Ensure carnet is available

        const evaluationsToFetchMembersFor = evaluations.filter(
            evaluation => evaluation.esGrupal && expandedEvaluationIds.has(evaluation.idEvaluacion)
        );

        for (const evaluation of evaluationsToFetchMembersFor) {
            // Only fetch if members haven't been fetched for this evaluation yet
            if (!groupMembers[evaluation.idEvaluacion]) {
                try {
                    const membersResponse = await axios.get<GrupoTrabajoMiembroDto[]>(`http://localhost:${port}/api/EstudianteGrupo/grupo-trabajo-miembros/${user.carnet}/${evaluation.idEvaluacion}`); // Updated return type
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

    // New useEffect to fetch group members when evaluations are expanded
    useEffect(() => {
        fetchGroupMembers();
    }, [expandedEvaluationIds, evaluations, user.carnet, groupMembers]); // Depend on expandedEvaluationIds and evaluations

    const handleFileUpload = async (evaluationId: number, file: File) => {
        try {

            setUploadingFile(evaluationId);
            // Clear previous success message for this evaluation
            setUploadSuccessMessage(prev => ({ ...prev, [evaluationId]: null }));

            const formData = new FormData();
            formData.append('file', file);
            formData.append('idEvaluacion', evaluationId.toString());
            const localLink = 'http://localhost:' + port + '/api/Entrega/especificacion';
            const response = await axios.put<{ message: string, filePath: string }>(localLink, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Temporarily show a success message instead of updating deliveries state
            setUploadSuccessMessage(prev => ({ ...prev, [evaluationId]: response.data.message }));
            
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

    const handleFileDownload = async (evaluationId: number) => {
        try {
            const entrega = entregas[evaluationId];
            if (!entrega) return;

            const response = await axios.get(`http://localhost:${port}/api/Entrega/descargar/${entrega.idEntrega}`, {
                responseType: 'blob'
            });

            // Create a download link and trigger it
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `entregable_${evaluationId}.zip`); // or whatever extension is appropriate
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Error downloading file:", err);
            // You might want to show an error message to the user here
        }
    };

    const openNewEvaluationDialog = (rubroId: number | undefined, rubroNombre: string) =>{
        if(rubroId != undefined){
            (document.getElementById('dialogCreate') as HTMLDialogElement)?.showModal();
            setNewEvaluationRubroName(rubroNombre);
            setNewEvaluationRubro(rubroId);
        }
    }

    const downloadEspecificacion = async(idEvaluacion: number | undefined) =>{
        if(idEvaluacion !== undefined){
            try{
                const downloadUrl = `http://localhost:${port}/api/Entrega/descargar-especificacion/${idEvaluacion}`;
                window.open(downloadUrl, '_blank');
            }catch(error){
                console.log("No se logró descargar la especificación correctamente. Error: ", error);
            }
        }
    }

    const downloadEntregas = async(idEvaluacion: number | undefined) =>{
        if(idEvaluacion !== undefined){
            try{
                const downloadUrl = `http://localhost:${port}/api/Entrega/descargar-entregas-evaluacion/${idEvaluacion}`;
                window.open(downloadUrl, '_blank');
            }catch(error){
                console.log("No se lograron descargar los entregables: ", error);
            }
        }
    }

    const closeNewEvaluationDialog = () =>{
        (document.getElementById('dialogCreate') as HTMLDialogElement)?.close();
    }

    const crearEvaluacion = async() =>{
        if(newEvaluationName.length > 0){
            if(newEvaluationDate.length > 0){
                var groupSize = 1;
                if(!newEvaluationWithGroups){
                    groupSize = newEvaluationGroupSize;
                }
                const newEvaluation = {
                    idRubro: newEvaluationRubro,
                    nombreEvaluacion: newEvaluationName,
                    fechaHoraLimite: newEvaluationDate+ "T" + newEvaluationTime,
                    valorPorcentual: newEvaluationPercentage,
                    esGrupal: newEvaluationWithGroups,
                    tieneEntregable: newEvaluationhasEntregable,
                    cantEstudiantesGrupo: groupSize,
                    rutaEspecificacion: ''
                }
                console.log(newEvaluation);
                const url = 'http://localhost:' + port + '/api/Evaluacion';
                try{
                    await axios.post(url, newEvaluation);
                    alert("Se ha publicado la evaluación exitosamente.");
                    closeNewEvaluationDialog();
                    fetchData();
                }catch(error){
                    console.log("Ha fallado la publicación de la evaluación ", error);
                }
            }else{
                alert("Debe colocar una fecha para la evaluación");
            }
        }else{
            alert("Debe colocar un nombre para la evaluación");
        }
    }

    const empezarActualización = (IdNotaEvaluacion: number | null) =>{
        if(IdNotaEvaluacion != null){
            if(IdNotaEvaluacion === notaIdIsActualizando){
                setNotaIdIsActualizando(-1);
            }else{
                setNotaIdIsActualizando(IdNotaEvaluacion);
                let changed = listaNotasEvaluacion.find((nota) => nota.idNotaEvaluacion == IdNotaEvaluacion);
                if(changed != null){
                    setNotaActualizarValor(changed.porcentajeObtenido);
                    setNotaActualizarPublicada(changed.publicada);
                    setNotaActualizarObservaciones(changed.observaciones);
                }
            }
        }
    }

    const actualizarEstadoNotaEvaluacion = async(IdNotaEvaluacion:number|null) =>{
        if(IdNotaEvaluacion != null){
            let changed = listaNotasEvaluacion.find((nota) => nota.idNotaEvaluacion == IdNotaEvaluacion);
            if(changed != null){
                try{
                    let sendThis = {
                        porcentajeObtenido: notaActualizarValor,
                        observaciones: notaActualizarObservaciones,
                        rutaArchivoDetalles: "", 
                        publicada: notaActualizarPublicada
                    }
                    const url = 'http://localhost:' + port + '/api/NotaEvaluacion/' + IdNotaEvaluacion;
                    await axios.put(url, sendThis);
                    setListaNotas(changed.idEvaluacion);
                    setNotaIdIsActualizando(-1);
                }catch(error){
                    console.log("Error al tratar de actualizar la nota ", error);
                }
            }
        }
    }

    const setListaNotas = async(idEvaluacion: number|null) =>{
        if(idEvaluacion != null){
            try{
                const response = await axios.get<NotaEvaluacion[]>(`http://localhost:${port}/api/EstudianteGrupo/notas-evaluacion/${idEvaluacion}`);
                setListaNotasEvaluacion(response.data);
            }catch(error){
                console.log("No se pudieron obtener las notas: ", error);
            }
        }
    }

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
                        <h3 className="text-xl font-semibold text-gray-800">{user.nombre || user.carnet}</h3>
                    </div>
                </div>
                {/* Placeholder for Final Grade */}
                <div className="text-xl font-bold text-gray-800">-- / 100</div>
            </div>

            {/* Evaluaciones grouped by Rubro */}
            {Object.entries(evaluationsByRubro).map(([rubroNombre, rubroData]) => (
                <div key={rubroNombre} className="bg-white rounded-lg shadow overflow-hidden">
                    {/* Rubro Header */}
                    <div className="flex items-center justify-between bg-gray-200 px-4 py-3">
                        <div style={{flexDirection:'row', display: 'flex'}}>
                            <h4 className="text-lg font-semibold text-gray-700">{rubroNombre}</h4>
                            <div className='delete-button' style={{marginTop:'-2px'}} onClick={() => openNewEvaluationDialog(rubroData.rubroId, rubroNombre)}>
                                +
                            </div>
                        </div>
                        {/* Display Rubro's total percentage/points */}
                        <div className="text-gray-700">-- / {rubroData.rubroPorcentaje}%</div>
                         {/* Placeholder for Add/Remove Rubro if needed - Use the existing icon styles */}
                         {/* <button className="text-gray-500 hover:text-gray-700"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></button> */}
                         {/* Placeholder for Expand/Collapse Rubro if needed - Use the existing icon styles */}
                         {/* <button className="text-gray-500 hover:text-gray-700"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z"></path></svg></button> */}
                    </div>

                    {/* Evaluaciones List for this Rubro */}
                    <ul className="divide-y divide-gray-200">
                        {rubroData.evaluaciones.map((evaluation) => {
                             // Find the Entrega for this evaluation, considering both individual and group
                             const entrega = entregas[evaluation.idEvaluacion];

                            

                            return (
                                <li key={evaluation.idEvaluacion} className="border-b border-gray-200 last:border-b-0">
                                    <div className="px-4 py-3 flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-700">{evaluation.nombreEvaluacion}</p>
                                            {/* Optional: Due date, type, etc. */}
                                             <p className="text-gray-600 text-sm">Fecha Límite: {new Date(evaluation.fechaHoraLimite).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex items-center space-x-3">

                                            {/* Deliverables Dropdown/Button */}
                                             <button
                                                onClick={() => {toggleExpand(evaluation.idEvaluacion); setListaNotas(evaluation.idEvaluacion);}}
                                                className="text-gray-500 hover:text-gray-700 transform transition-transform"
                                            >
                                                {/* Icon changes based on expanded state */}
                                                <svg className={`w-5 h-5 ${expandedEvaluationIds.has(evaluation.idEvaluacion) ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </button>
                                        </div>
                                    </div>
                                    {/* Expandable Content for Deliverables and Assignment Details */}
                                    {expandedEvaluationIds.has(evaluation.idEvaluacion) && (
                                        <div className="px-4 py-3 bg-gray-100 border-t border-gray-200" >
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
                                                                
                                                            </div>
                                                        )}

                                                        {/* Especificación - Moved here */}                                                         {evaluation.rutaEspecificacion && (
                                                            <div className="mt-2">
                                                                <div style={{display: 'flex',flexDirection: 'column'}}>
                                                                    <a
                                                                        className="text-blue-600 hover:underline"
                                                                        style={{cursor:'pointer'}}
                                                                        onClick={()=>downloadEspecificacion(evaluation.idEvaluacion)}
                                                                    >
                                                                        Ver Especificación
                                                                    </a>
                                                                    <a
                                                                        className="text-blue-600 hover:underline"
                                                                        style={{cursor:'pointer'}}
                                                                        onClick={()=>downloadEntregas(evaluation.idEvaluacion)}
                                                                    >
                                                                        Descargar Entregables
                                                                    </a>
                                                                </div>
                                                            </div>
                                                            
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Especificación Columna */}
                                                <div>
                                                    <p className="font-semibold text-gray-700">Especificación:</p>
                                                    <div className="ml-2 mt-2 space-y-2 text-sm">
                                                        {/* Upload/Download area */}
                                                        {( /* Only show if deliverable is required */
                                                            <div>
                                                                 {entrega ? (
                                                                    // If there is a delivery
                                                                    <div className="space-y-2">
                                                                        <div>
                                                                            <span className="font-medium text-green-600">Estado:</span>
                                                                            <span className="text-gray-700 ml-1">Entregado</span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="font-medium text-gray-700">Fecha de Entrega:</span>
                                                                            <span className="text-gray-700 ml-1">{new Date(entrega.fechaEntrega).toLocaleString()}</span>
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
                                                                    new Date() > new Date(evaluation.fechaHoraLimite) ? (
                                                                        // If no delivery and past due
                                                                        <p className="text-red-600">La fecha límite ha pasado.</p>
                                                                    ) : (
                                                                        // If no delivery and not past due
                                                                        <div className="space-y-2">
                                                                             <p className="text-yellow-700 font-medium">Estado: En plazo de entrega.</p>
                                                                            {/* File Upload Area - Simplified for now */}                                                                             <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
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
                                                                            {/* Display success message */}                                                                             {uploadSuccessMessage[evaluation.idEvaluacion] && (
                                                                                <span className="ml-2 text-green-600 text-sm">{uploadSuccessMessage[evaluation.idEvaluacion]}</span>
                                                                             )}
                                                                            {/* Optional: Entrega mediante Enlace (URL) - Placeholder */}
                                                                            {/* <button className="text-blue-600 hover:underline text-sm mt-1">o Entregar mediante un Enlace (URL)</button> */}
                                                                        </div>
                                                                    )
                                                                )}
                                                            </div>
                                                        )}

                                                    </div>
                                                </div>
                                            </div>
                                            {/*Acá debe de terminar*/}
                                            <div >
                                                
                                                <div style={{display: 'flex', justifyContent:'center', alignContent: 'center'}}>
                                                    <table style={{width:'100%'}}>
                                                        <tr>
                                                            <th className='columna-header'>Carnet</th>
                                                            <th className='columna-header'>Publicada</th>
                                                            <th className='columna-header'>Nota</th>
                                                            <th className='columna-header'>Observaciones</th>
                                                            <th className='columna-header'>Actualizar</th>
                                                            <th className='columna-header'>Guardar</th>
                                                        </tr>
                                                        {
                                                            listaNotasEvaluacion.map((nota) =>(
                                                                <tr key={nota.idNotaEvaluacion} style={{justifyContent:'space-between'}}>
                                                                    <td >
                                                                        <div>
                                                                            {nota.carnetEstudiante}
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div style={{display: showThisBlock(notaIdIsActualizando, nota.idNotaEvaluacion, false)}}>
                                                                            {(nota.publicada) ? "Sí":"No"}
                                                                        </div>
                                                                        <form className='button-rows' style={{display: showThisBlock(notaIdIsActualizando, nota.idNotaEvaluacion, true)}}>
                                                                            <input type="radio" id={"siPublica_" + nota.idNotaEvaluacion} name="hasPublica" checked={notaActualizarPublicada} value={1} onClick={() => {setNotaActualizarPublicada(true)}}/>
                                                                            <label htmlFor={"siPublica_" + nota.idNotaEvaluacion} style={{marginRight:'10px'}}>Sí</label><br></br>
                                                                            <input type="radio" id={"noPublica_" + nota.idNotaEvaluacion} name="hasPublica" value={0} checked={!notaActualizarPublicada} onClick={() =>{setNotaActualizarPublicada(false)}}/>
                                                                            <label htmlFor={"noPublica_" + nota.idNotaEvaluacion}>No</label><br></br>
                                                                        </form>
                                                                    </td>
                                                                    <td>
                                                                        <div style={{display:showThisBlock(notaIdIsActualizando, nota.idNotaEvaluacion, false)}}>
                                                                            {nota.porcentajeObtenido}
                                                                        </div>
                                                                        <input
                                                                            id="notaNota"
                                                                            name="notaNota"
                                                                            type="email"
                                                                            style={{maxWidth:'100px', marginBottom:'5px', display: showThisBlock(notaIdIsActualizando, nota.idNotaEvaluacion, true)}}
                                                                            required
                                                                            className="custom-input"
                                                                            placeholder="Valor"
                                                                            value={notaActualizarValor}
                                                                            onChange={e => setNotaActualizarValor(parseFloat(e.target.value))}
                                                                        />
                                                                    </td>
                                                                    <td>
                                                                        <div style={{overflow:'hidden', display:showThisBlock(notaIdIsActualizando, nota.idNotaEvaluacion, false)}}>
                                                                            {nota.observaciones}
                                                                        </div>
                                                                        <input
                                                                            id="notaObs"
                                                                            name="notaObs"
                                                                            type="email"
                                                                            style={{maxWidth:'100px', marginBottom:'5px', display: showThisBlock(notaIdIsActualizando, nota.idNotaEvaluacion, true)}}
                                                                            required
                                                                            className="custom-input"
                                                                            placeholder="Observaciones..."
                                                                            value={notaActualizarObservaciones}
                                                                            onChange={e => setNotaActualizarObservaciones(e.target.value)}
                                                                        />
                                                                    </td>
                                                                    <td>
                                                                        <div className='publish-button' onClick={() => empezarActualización(nota.idNotaEvaluacion)}>
                                                                            Actualizar
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className='publish-button'  style={{display: showThisBlock(notaIdIsActualizando, nota.idNotaEvaluacion, true)}} onClick={() => actualizarEstadoNotaEvaluacion(nota.idNotaEvaluacion)}>
                                                                           Guardar
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        }
                                                    </table>
                                                </div>
                                            </div>
                                            
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ))}

            {/* Diálogo para crear una nueva evaluación*/}
            <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold text-gray-800">
                    <span>Nota Total (sin redondear)</span>
                    {/* Placeholder Calculation */}
                    <span>-- / 100</span>
                </div>
                <div className="flex justify-between items-center text-xl font-bold text-gray-800">
                    <span>Nota final</span>
                    {/* Placeholder Calculation */}
                    <span>-- / 100</span>
                </div>
            </div>
            {/** Dialogo para crear nueva asignación */}
            <dialog className='dialog-box' id='dialogCreate' style={{position:'fixed', top:'25%', minWidth:'450px'}}>
                <div>
                    <div className='dialog-main-title'>
                        Crear asignación
                    </div>
                    <div className='dialog-rows'>
                        <div className='input-tag'>
                            Nombre:
                        </div>
                        <input
                            id="newEvaNameInput"
                            name="newEvaNameInput"
                            type="email"
                            style={{maxWidth:'200px', marginBottom:'5px', justifyContent:'center'}}
                            required
                            className="custom-input"
                            placeholder="Nombre de la evaluación"
                            value={newEvaluationName}
                            onChange={e => setNewEvaluationName(e.target.value)}
                        />
                    </div>
                    <div className='dialog-rows'>
                        <div className='input-tag'>
                            Porcentaje:
                        </div>
                        <input
                            id="newEvaPercInput"
                            name="newEvaPercInput"
                            type="number"
                            style={{maxWidth:'200px', marginBottom:'5px', justifyContent:'center'}}
                            required
                            className="custom-input"
                            placeholder="Porcentaje"
                            value={newEvaluationPercentage}
                            onChange={e => setNewEvaluationPercentage(parseFloat(e.target.value))}
                        />
                    </div>
                    <div className='dialog-rows'>
                        <div className='input-tag'>
                            Es grupal:
                        </div>
                        <form className='button-rows'>
                            <input type="radio" id="siGrupal" name="isGrupal" value={1} onClick={() => {setNewEvaluationsWithGroups(true)}}/>
                            <label htmlFor="siGrupal" style={{marginRight:'10px'}}>Sí</label><br></br>
                            <input type="radio" id="noGrupal" name="isGrupal" value={0} onClick={() =>{setNewEvaluationsWithGroups(false)}}/>
                            <label htmlFor="noGrupal">No</label><br></br>
                        </form>
                    </div>
                    <div style={{display:askAmountOfStudents(newEvaluationWithGroups)}}>
                        <div className='dialog-rows' >
                            <div className='input-tag'>
                                Estudiantes por grupo: 
                            </div>
                            <input
                                id="newEvaTeamSizeInput"
                                name="newEvaTeamSizeInput"
                                type="number"
                                style={{maxWidth:'50px', marginBottom:'5px', justifyContent:'center'}}
                                required
                                className="custom-input"
                                placeholder="Tamaño del grupo"
                                value={newEvaluationGroupSize}
                                onChange={e => setNewEvaluationsGroupSize(parseInt(e.target.value))}
                            />
                        </div>
                    </div>
                    <div className='dialog-rows'>
                        <div className='input-tag'>
                            Fecha de Entrega:
                        </div>
                        <input
                            id="newEvaTeamSizeInput"
                            name="newEvaTeamSizeInput"
                            type="date"
                            style={{maxWidth:'200px', marginBottom:'5px', justifyContent:'center'}}
                            required
                            className="custom-input"
                            placeholder="Fecha de entrega"
                            value={newEvaluationDate}
                            onChange={e=>setNewEvaluationDate(e.target.value)}
                        />
                    </div>
                    <div className='dialog-rows'>
                        <div className='input-tag'>
                            Hora de Entrega:
                        </div>
                        <input
                            id="newEvaTeamSizeInput"
                            name="newEvaTeamSizeInput"
                            type="time"
                            style={{maxWidth:'200px', marginBottom:'5px', justifyContent:'center'}}
                            required
                            className="custom-input"
                            placeholder="Hora de entrega"
                            value={newEvaluationTime}
                            onChange={e => setNewEvaluationTime(e.target.value)}
                        />
                    </div>
                    <div className='dialog-rows'>
                        <div className='input-tag'>
                            Tiene entregable:
                        </div>
                        <form className='button-rows'>
                            <input type="radio" id="siEntrega" name="hasEntrega" value={1} onClick={() => {setNewEvaluationsHasEntregable(true)}}/>
                            <label htmlFor="siEntrega" style={{marginRight:'10px'}}>Sí</label><br></br>
                            <input type="radio" id="noEntrega" name="hasEntrega" value={0} onClick={() =>{setNewEvaluationsHasEntregable(false)}}/>
                            <label htmlFor="noEntrega">No</label><br></br>
                        </form>
                    </div>
                    <div className='button-rows' style={{marginTop:'25px'}}>
                        <div className='delete-button' onClick={closeNewEvaluationDialog}>
                            Cancelar
                        </div>
                        <div className='delete-button' onClick={crearEvaluacion}>
                            Crear
                        </div>
                    </div>
                </div>
            </dialog>
        </div>
        
    );
};

export default ProfessorEvaluations; 