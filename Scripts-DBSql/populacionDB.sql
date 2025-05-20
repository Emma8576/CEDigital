-- Script de populaci�n (datos minimos iniciales)

USE CEDigital;
GO

-- Carreras
INSERT INTO Carrera (NombreCarrera) VALUES ('Ingenier�a en Computadores');
INSERT INTO Carrera (NombreCarrera) VALUES ('Ingenier�a Electr�nica');
INSERT INTO Carrera (NombreCarrera) VALUES ('Ingenier�a F�sica');
INSERT INTO Carrera (NombreCarrera) VALUES ('Ingenier�a Mecatr�nica');
INSERT INTO Carrera (NombreCarrera) VALUES ('Administraci�n de Empresas');
INSERT INTO Carrera (NombreCarrera) VALUES ('Ense�anza de la Matem�tica con Entornos Tecnol�gicos');
SELECT * FROM Carrera;

-- Semestre 
INSERT INTO Semestre (Periodo, A�o) VALUES ('1', 2025);

-- Cursos 
INSERT INTO Curso (CodigoCurso, NombreCurso, Creditos, IdCarrera)
VALUES 
-- Cursos de Ingenier�a en Computadores
('CE1101', 'Introducci�n a la Programaci�n', 3, 1),
('CE1102', 'Fundamentos de Sistemas Computacionales', 3, 1),
('CE1103', 'Algoritmos y Estructuras de Bases I', 4, 1),
('CExx', 'Principios de modelado', 3, 1),
('CE2203', 'Algoritmos y Estructuras de Bases 2', 4, 1),
('CEx1', 'Paradigmas de Programaci�n', 3, 1),
('CE1104', 'Algoritmos y Estructuras de Bases I', 3, 1),
('CE2201', 'Laboratorio de Circuitos El�ctricos', 1, 1),
('CE1105', 'Algoritmos y Estructuras de Bases I', 4, 1),
('CE3101', 'Bases de Datos', 4, 1),
('CE3201', 'Taller de Dise�o Digital', 2, 1),
('CE2204', 'Arquitectura de Computadores', 4, 1),
-- Cursos de Ingenier�a Electr�nica
('EL1100', 'Introducci�n a la Ingenier�a', 1, 2),
('EL1200', 'Introducci�n a la Electr�nica', 2, 2),
('EL2113', 'Circuitos en Corriente Continua', 4, 2),
('EL2111', 'Laboratorios de Circuitos El�ctricos', 1, 2),
('EL2114 ', 'Circuitos en Corriente Alterna', 4, 2),
('EL2207', 'Elementos Activos', 4, 2),
('EL4702', 'Probabilidad y Estad�stica', 3, 2),
('EL3212', 'Circuitos Discretos', 4, 2),
('EL3215', 'Laboratorio de electr�nica anal�gica', 1, 2),
-- Cursos de Ingenier�a F�sica
('FI1101', 'F�sica General I', 2, 3),
('FI1201', 'Laboratorio de F�sica General 1', 1, 3),
('FI1102', 'F�sica General II', 3, 3),
('FI1202', 'Laboratorio de F�sica General II', 1, 3);

-- Grupos
INSERT INTO Grupo (CodigoCurso, IdSemestre, NumeroGrupo)
VALUES 
('CE1101', 1, 1),
('FI1101', 1, 1),
('CE1102', 1, 1),
('EL1100', 1, 1);

-- ProfesorGrupo
INSERT INTO ProfesorGrupo (IdGrupo, CedulaProfesor)
VALUES
(1, '309980212'),
(2, '809980212'),
(3, '304120981'),
(4, '309980212');

-- EstudianteGrupo
INSERT INTO EstudianteGrupo (IdGrupo, CarnetEstudiante)
VALUES
(1, '2023301199'),
(1, '2023298134'),
(1, '2023113987'),
(1, '2023213444'),
(1, '2022096711'),
(2, '2023301199'),
(2, '2023298134'),
(2, '2023113987'),
(2, '2023213444'),
(2, '2022096711'),
(3, '2023301199'),
(3, '2023298134'),
(3, '2023113987'),
(3, '2023213444'),
(3, '2022096711'),
(4, '2023301199'),
(4, '2023298134'),
(4, '2023113987'),
(4, '2023213444'),
(4, '2022096711');

-- Carpetas
INSERT INTO Carpeta (NombreCarpeta, IdGrupo)
VALUES
('Presentaciones', 1),
('Quices', 1),
('Ex�menes',1),
('Proyectos', 1),
('Presentaciones', 2),
('Quices', 2),
('Ex�menes',2),
('Proyectos', 2),
('Presentaciones', 3),
('Quices', 3),
('Ex�menes',3),
('Proyectos', 3),
('Presentaciones', 4),
('Quices', 4),
('Ex�menes',4),
('Proyectos', 4);

-- Archivos
INSERT INTO Archivo (NombreArchivo, FechaPublicacion, Tama�oArchivo, IdCarpeta, Ruta)
VALUES
('IntroProgramacion1.pdf', GETDATE(), 204800, 1, '/uploads/intro/IntroProgramacion1.pdf'),
('Quiz1.docx', GETDATE(), 102400, 2, '/uploads/quices/Quiz1.docx'),
('ExamenLabF�sica1.xlsx', GETDATE(), 51200, 3, '/uploads/labs/ExamenLabF�sica1.xlsx');

-- Noticias
INSERT INTO Noticia (Titulo, Mensaje, FechaPublicacion, IdGrupo)
VALUES
('Bienvenida al curso', '�Bienvenidos al curso CE1101! Este ser� un semestre emocionante.', GETDATE(), 1),
('Cambio de horario', 'Se ha cambiado el horario del laboratorio del curso FI1101.', GETDATE(), 2);

-- Rubros
INSERT INTO Rubro (NombreRubro, Porcentaje, IdGrupo)
VALUES
('Quices', 30, 1),
('Ex�menes', 30, 1),
('Proyectos', 40, 1);

-- Evaluaciones
INSERT INTO Evaluacion (IdRubro, NombreEvaluacion, FechaHoraLimite, ValorPorcentual, EsGrupal, TieneEntregable, CantEstudiantesGrupo, RutaEspecificacion)
VALUES
(1, 'Quiz 1', DATEADD(DAY, 7, GETDATE()), 15, 0, 1, 1, '/especificaciones/quiz1.pdf'),
(2, 'Examen 1', DATEADD(DAY, 14, GETDATE()), 30, 0, 1, 1, '/especificaciones/examen1.pdf'),
(3, 'Proyecto 1', DATEADD(DAY, 21, GETDATE()), 40, 1, 1, 2, '/especificaciones/proyecto1.pdf');

-- GrupoTrabajo (solo para Proyecto 1 que es grupal)
INSERT INTO GrupoTrabajo (CarnetEstudiante, IdGrupoTrabajo, IdEvaluacion)
VALUES 
('2023298134', 1, 3),
('2023113987', 1, 3);

-- Entregas
INSERT INTO Entrega (IdEvaluacion, IdGrupoTrabajo, CarnetEstudiante, FechaEntrega, RutaEntregable)
VALUES
-- Para entregas individuales
(1, NULL, '2023298134', GETDATE(), '/entregas/quiz1_est1.pdf'),
(2, NULL, '2023298134', GETDATE(), '/entregas/examen1_est1.pdf'),
-- Para entrega grupal
(3, 1, NULL, GETDATE(), '/entregas/proyecto1_grupo1.zip');

-- NotaEvaluacion
INSERT INTO NotaEvaluacion (PorcentajeObtenido, Observaciones, RutaArchivoDetalles, Publicada, IdEvaluacion, IdGrupoTrabajo)
VALUES
(85.50, 'Buen trabajo en el proyecto', '/notas/proyecto1_detalles.pdf', 1, 3, 1);