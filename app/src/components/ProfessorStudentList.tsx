import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import './ProfessorStudentList.css'

interface ProfessorStudentListProps {
    idGrupo: number;
    user: {
        carnet?: string;
        nombre?: string;
    };
}

interface Student{
    id: string,
    nombre: string,
    correo: string,
    password: string,
    carnet: string,
    telefono: string
}

const ProfessorStudentList: React.FC<ProfessorStudentListProps> = ({ idGrupo, user }) => {
    const port = '5000';
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [students, setStudents] = useState<Student[]>([]);

    const fetchStudents = async () =>{
        try{
            setLoading(true);
            const response = await axios.get<Student[]>(`http://localhost:${port}/api/EstudianteGrupo/grupo-con-estudiantes-full/${idGrupo}`);
            setStudents(response.data);
            setLoading(false);
        }catch(err){
            console.error("Error fetching news:", err);
            setError("Error al cargar la lista estudiantil.");
            setLoading(false);
        }
    }

    const downloadList = () =>{
        if(students.length > 0){
            const doc = new jsPDF();
            doc.setFontSize(16);
            doc.text("Lista de Estudiantes", 20,20);
             doc.setFontSize(12);

            let y = 30;
            students.forEach((student, index) => {
                // Salto de página si se pasa del borde inferior
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }
                doc.text(`${index + 1}. Nombre: ${student.nombre}`, 20, y);
                y += 7;
                doc.text(`   Carnet: ${student.carnet}`, 20, y);
                y += 7;
                doc.text(`   Correo: ${student.correo}`, 20, y);
                y += 10;                
            });

            doc.save('estudiantes.pdf');
        }
    }

    useEffect(() => {
        fetchStudents();
    }, [idGrupo]); 

    if (loading) {
        return <div className="text-center mt-4 text-gray-600">Cargando lista de estudiantes...</div>;
    }

    if (error) {
        return <div className="text-center mt-4 text-red-600">Error: {error}</div>;
    }

    if (students.length == 0) {
        return <div className="text-center mt-4 text-gray-500">No hay alumnos matriculados para este grupo.</div>;
    }

    return(
        <div className="space-y-4">
            <div style={{display:'grid'}}>
                <div style={{justifyContent:'center', display:'flex'}}>
                <table style={{width:'100%'}}>
                    <tr>
                        <th className='columna-header'>Carnet</th>
                        <th className='columna-header'>Nombre Completo</th>
                        <th className='columna-header'>Correo</th>
                        <th className='columna-header'>Telefono</th>
                    </tr>
                    {
                        students.map((student) => (
                            <tr key={student.id} style={{justifyContent:'space-between'}}>
                                <td>
                                    <div className='columna-content'>
                                        {student.carnet}
                                    </div>
                                </td>
                                <td >
                                    <div className='columna-content'>
                                        {student.nombre}
                                    </div>
                                </td>
                                <td>
                                    <div className='columna-content'>
                                        {student.correo}
                                    </div>
                                </td>
                                <td>
                                    <div className='columna-content'>
                                        {student.telefono}
                                    </div>
                                </td>
                            </tr>
                        ))
                    }
                </table>
                </div>
                <div  style={{marginTop:'15px', width:'100%'}}>
                    <div className='publish-button' style={{float:'right'}} onClick={downloadList}>
                        Descargar Lista
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfessorStudentList;