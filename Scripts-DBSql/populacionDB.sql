-- Script de populación (datos minimos iniciales)

-- Carreras
INSERT INTO Carrera (NombreCarrera) VALUES ('Ingeniería en Computadores');
INSERT INTO Carrera (NombreCarrera) VALUES ('Ingeniería Electrónica');
INSERT INTO Carrera (NombreCarrera) VALUES ('Ingeniería Física');
INSERT INTO Carrera (NombreCarrera) VALUES ('Ingeniería Mecatrónica');
INSERT INTO Carrera (NombreCarrera) VALUES ('Administración de Empresas');
INSERT INTO Carrera (NombreCarrera) VALUES ('Enseñanza de la Matemática con Entornos Tecnológicos');
SELECT * FROM Carrera;

-- Semestre 
INSERT INTO Semestre (Periodo, Año) VALUES ('1', 2025);

-- Cursos 
INSERT INTO Curso (CodigoCurso, NombreCurso, Creditos, IdCarrera)
VALUES 
-- Cursos de Ingeniería en Computadores
('CE1101', 'Introducción a la Programación', 3, 1),
('CE1102', 'Fundamentos de Sistemas Computacionales', 3, 1),
('CE1103', 'Algoritmos y Estructuras de Bases I', 4, 1),
('CExx', 'Principios de modelado', 3, 1),
('CE2203', 'Algoritmos y Estructuras de Bases 2', 4, 1),
('CEx1', 'Paradigmas de Programación', 3, 1),
('CE1104', 'Algoritmos y Estructuras de Bases I', 3, 1),
('CE2201', 'Laboratorio de Circuitos Eléctricos', 1, 1),
('CE1105', 'Algoritmos y Estructuras de Bases I', 4, 1),
('CE3101', 'Bases de Datos', 4, 1),
('CE3201', 'Taller de Diseño Digital', 2, 1),
('CE2204', 'Arquitectura de Computadores', 4, 1),
-- Cursos de Ingeniería Electrónica
('EL1100', 'Introducción a la Ingeniería', 1, 2),
('EL1200', 'Introducción a la Electrónica', 2, 2),
('EL2113', 'Circuitos en Corriente Continua', 4, 2),
('EL2111', 'Laboratorios de Circuitos Eléctricos', 1, 2),
('EL2114 ', 'Circuitos en Corriente Alterna', 4, 2),
('EL2207', 'Elementos Activos', 4, 2),
('EL4702', 'Probabilidad y Estadística', 3, 2),
('EL3212', 'Circuitos Discretos', 4, 2),
('EL3215', 'Laboratorio de electrónica analógica', 1, 2),
-- Cursos de Ingeniería Física
('FI1101', 'Física General I', 2, 3),
('FI1201', 'Laboratorio de Física General 1', 1, 3),
('FI1102', 'Física General II', 3, 3),
('FI1202', 'Laboratorio de Física General II', 1, 3);

-- Grupos
INSERT INTO Grupo (CodigoCurso, IdSemestre, NumeroGrupo)
VALUES 
('CE1101', 1, 1),
('FI1101', 1, 1);

-- ProfesorGrupo
INSERT INTO ProfesorGrupo (IdGrupo, CedulaProfesor)
VALUES
(1, 'ProfPrueba01'),
(1, 'ProfPrueba02'),
(2, 'ProfPrueba03'),
(2, 'ProfPrueba04');

-- EstudianteGrupo
INSERT INTO EstudianteGrupo (IdGrupo, CarnetEstudiante)
VALUES
(1, 'EstudPrueba01'),
(1, 'EstudPrueba02'),
(1, 'EstudPrueba03'),
(2, 'EstudPrueba04'),
(2, 'EstudPrueba05');

-- Carpetas
INSERT INTO Carpeta (NombreCarpeta, IdGrupo)
VALUES
('Presentaciones', 1),
('Quices', 1),
('Exámenes',1),
('Proyectos', 1),
('Presentaciones', 2),
('Quices', 2),
('Exámenes',2),
('Proyectos', 2);

-- Archivos
INSERT INTO Archivo (NombreArchivo, FechaPublicacion, TamañoArchivo, IdCarpeta, Ruta)
VALUES
('IntroProgramacion1.pdf', GETDATE(), 204800, 1, '/uploads/intro/IntroProgramacion1.pdf'),
('Quiz1.docx', GETDATE(), 102400, 2, '/uploads/quices/Quiz1.docx'),
('ExamenLabFísica1.xlsx', GETDATE(), 51200, 3, '/uploads/labs/ExamenLabFísica1.xlsx');

-- Noticias
INSERT INTO Noticia (Titulo, Mensaje, FechaPublicacion, IdGrupo)
VALUES
('Bienvenida al curso', '¡Bienvenidos al curso CE1101! Este será un semestre emocionante.', GETDATE(), 1),
('Cambio de horario', 'Se ha cambiado el horario del laboratorio del curso FI1101.', GETDATE(), 2);

-- Rubros
INSERT INTO Rubro (NombreRubro, Porcentaje, IdGrupo)
VALUES
('Quices', 30, 1),
('Exámenes', 30, 1),
('Proyectos', 40, 1);

-- Evaluaciones
INSERT INTO Evaluacion (IdRubro, NombreEvaluacion, FechaHoraLimite, ValorPorcentual, EsGrupal, TieneEntregable, CantEstudiantesGrupo, RutaEspecificacion)
VALUES
(1, 'Quiz 1', DATEADD(DAY, 7, GETDATE()), 15, 0, 1, 1, '/especificaciones/quiz1.pdf'),
(2, 'Examen 1', DATEADD(DAY, 14, GETDATE()), 30, 0, 1, 1, '/especificaciones/examen1.pdf'),
(3, 'Proyecto 1', DATEADD(DAY, 21, GETDATE()), 40, 1, 1, 2, '/especificaciones/proyecto1.pdf');

-- GrupoTrabajo (solo para Proyecto 1 que es grupal)
INSERT INTO GrupoTrabajo (CarnetEstudiante, IdGrupoTrabajo, IdEvaluacion)
VALUES ('EstudPrueba01', 1, 3),
('EstudPrueba02', 1, 3);

-- Entregas
INSERT INTO Entrega (IdEvaluacion, IdGrupoTrabajo, CarnetEstudiante, FechaEntrega, RutaEntregable)
VALUES
-- Para entregas individuales
(1, NULL, 'EstudPrueba01', GETDATE(), '/entregas/quiz1_est1.pdf'),
(2, NULL, 'EstudPrueba01', GETDATE(), '/entregas/examen1_est1.pdf'),
-- Para entrega grupal
(3, 1, NULL, GETDATE(), '/entregas/proyecto1_grupo1.zip');

-- NotaEvaluacion
INSERT INTO NotaEvaluacion (PorcentajeObtenido, Observaciones, RutaArchivoDetalles, Publicada, IdEvaluacion, IdGrupoTrabajo)
VALUES
(85.50, 'Buen trabajo en el proyecto', '/notas/proyecto1_detalles.pdf', 1, 3, 1);
