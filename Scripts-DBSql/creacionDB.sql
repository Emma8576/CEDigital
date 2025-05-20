CREATE DATABASE CEDigital;
GO

USE CEDigital;
GO

-- Carrera
CREATE TABLE Carrera (
    IdCarrera INT IDENTITY PRIMARY KEY, --Auto incremental
    NombreCarrera VARCHAR(100) NOT NULL
);

-- Semestre
CREATE TABLE Semestre (
    IdSemestre INT IDENTITY PRIMARY KEY, --Auto incremental
	Periodo CHAR(1) CHECK (Periodo IN ('1', '2', 'V')) NOT NULL,
    Año INT NOT NULL
);

-- Curso
CREATE TABLE Curso (
    CodigoCurso VARCHAR(10) PRIMARY KEY,
    NombreCurso VARCHAR(100) NOT NULL,
    Creditos INT NOT NULL,
    IdCarrera INT NOT NULL,
    FOREIGN KEY (IdCarrera) REFERENCES Carrera(IdCarrera)
);

-- Grupo
CREATE TABLE Grupo (
    IdGrupo INT IDENTITY PRIMARY KEY, --Auto incremental
    CodigoCurso VARCHAR(10) NOT NULL,
    IdSemestre INT NOT NULL,
	NumeroGrupo INT NOT NULL,
    UNIQUE (CodigoCurso, NumeroGrupo, IdSemestre), -- Evitar numero de grupo de una misma materia repetida para un semestre
    FOREIGN KEY (CodigoCurso) REFERENCES Curso(CodigoCurso),
    FOREIGN KEY (IdSemestre) REFERENCES Semestre(IdSemestre)
);

-- ProfesorGrupo (dos* profesores por grupo)
CREATE TABLE ProfesorGrupo (
    IdGrupo INT NOT NULL,
    CedulaProfesor VARCHAR(20) NOT NULL, -- CedulaProfesor viene desde la base de MongoDB
    PRIMARY KEY (IdGrupo, CedulaProfesor),
	FOREIGN KEY (IdGrupo) REFERENCES Grupo(IdGrupo)
);

-- EstudianteGrupo (muchos estudiantes por grupo)
CREATE TABLE EstudianteGrupo (
    IdGrupo INT NOT NULL,
    CarnetEstudiante VARCHAR(20) NOT NULL,  -- CarnetEstudiante viene desde la base de MongoDB
    PRIMARY KEY (IdGrupo, CarnetEstudiante),
	FOREIGN KEY (IdGrupo) REFERENCES Grupo(IdGrupo)
);

-- Carpetas
CREATE TABLE Carpeta (
    IdCarpeta INT IDENTITY PRIMARY KEY, --Auto incremental
    NombreCarpeta VARCHAR(50) NOT NULL, -- Ej: Presentaciones, Quices, etc..
	IdGrupo INT NOT NULL,
	UNIQUE (NombreCarpeta, IdGrupo),
    FOREIGN KEY (IdGrupo) REFERENCES Grupo(IdGrupo)
);

--Archivos
CREATE TABLE Archivo (
	IdArchivo INT IDENTITY PRIMARY KEY, --Auto incremental
	NombreArchivo VARCHAR(255) NOT NULL,
    FechaPublicacion DATETIME NOT NULL,
    TamañoArchivo INT NOT NULL, -- en bytes
	IdCarpeta INT NOT NULL,
    Ruta VARCHAR(500),
	FOREIGN KEY (IdCarpeta) REFERENCES Carpeta(IdCarpeta)
);

-- Noticia
CREATE TABLE Noticia (
    IdNoticia INT IDENTITY PRIMARY KEY, --Auto incremental
    Titulo VARCHAR(200) NOT NULL,
    Mensaje VARCHAR(1500) NOT NULL, -- Considerando un mensaje de longitud media
    FechaPublicacion DATETIME NOT NULL,
	IdGrupo INT NOT NULL,
	UNIQUE (Titulo, Mensaje, IdGrupo),
    FOREIGN KEY (IdGrupo) REFERENCES Grupo(IdGrupo)
);

-- Rubros
CREATE TABLE Rubro (
    IdRubro INT IDENTITY PRIMARY KEY, --Auto incremental
    NombreRubro VARCHAR(100) NOT NULL, -- Por defecto: Quices 30%, Examenes 30% y Proyectos 40%
    Porcentaje INT NOT NULL,
	IdGrupo INT NOT NULL,
    FOREIGN KEY (IdGrupo) REFERENCES Grupo(IdGrupo)
);

-- Evaluaciones
CREATE TABLE Evaluacion (
    IdEvaluacion INT IDENTITY PRIMARY KEY, --Auto incremental
    IdRubro INT NOT NULL,
    NombreEvaluacion VARCHAR(100) NOT NULL,
    FechaHoraLimite DATETIME NOT NULL,
    ValorPorcentual INT NOT NULL,
    EsGrupal BIT NOT NULL,
	TieneEntregable BIT NOT NULL,
	CantEstudiantesGrupo INT NOT NULL,
    RutaEspecificacion VARCHAR(500),
    FOREIGN KEY (IdRubro) REFERENCES Rubro(IdRubro)
);

-- GrupoTrabajo (tabla principal de grupos de trabajo) -- Definición corregida
CREATE TABLE GrupoTrabajo (
    IdGrupoTrabajo INT IDENTITY PRIMARY KEY, -- PK auto-incremental simple
    IdEvaluacion INT NOT NULL,
    -- CarnetEstudiante NO va en esta tabla. La relación estudiante-grupo va en EstudianteGrupoTrabajo.
    FOREIGN KEY (IdEvaluacion) REFERENCES Evaluacion(IdEvaluacion)
);

-- EstudianteGrupoTrabajo (tabla de unión para asociar estudiantes a GrupoTrabajo)
CREATE TABLE EstudianteGrupoTrabajo (
    IdGrupoTrabajo INT NOT NULL,
    CarnetEstudiante VARCHAR(20) NOT NULL,
    PRIMARY KEY (IdGrupoTrabajo, CarnetEstudiante),
    FOREIGN KEY (IdGrupoTrabajo) REFERENCES GrupoTrabajo(IdGrupoTrabajo)
);

-- Entrega (una por estudiante o por grupo según Evaluacion.EsGrupal) -- Esta referencia ahora funcionará
CREATE TABLE Entrega (
    IdEntrega INT IDENTITY PRIMARY KEY, --Auto incremental
    IdEvaluacion INT NOT NULL,
	IdGrupoTrabajo INT NULL, --Se usa IdGrupoTrabajo si Evaluacion.EsGrupal = V; podría ser null
    CarnetEstudiante VARCHAR(20) NULL, --Se usa IdGrupoTrabajo si Evaluacion.EsGrupal = F; podría ser null
    FechaEntrega DATETIME NOT NULL,
    RutaEntregable VARCHAR(500),
    FOREIGN KEY (IdEvaluacion) REFERENCES Evaluacion(IdEvaluacion),
	FOREIGN KEY (IdGrupoTrabajo) REFERENCES GrupoTrabajo(IdGrupoTrabajo) -- Referencia a la nueva PK de GrupoTrabajo
);

-- Nota de evaluacion
CREATE TABLE NotaEvaluacion (
	IdNotaEvaluacion INT IDENTITY PRIMARY KEY, --Auto incremental
    PorcentajeObtenido DECIMAL(5,2) NOT NULL, -- Formato de tres enteros y dos decimales, ejem: 34.22, 100.00
    Observaciones VARCHAR(500),
	RutaArchivoDetalles VARCHAR(500),
	Publicada BIT NOT NULL,
	IdEvaluacion INT,
	IdGrupoTrabajo INT NOT NULL,
    
    FOREIGN KEY (IdEvaluacion) REFERENCES Evaluacion(IdEvaluacion),
	FOREIGN KEY (IdGrupoTrabajo) REFERENCES GrupoTrabajo(IdGrupoTrabajo) -- Referencia a la nueva PK de GrupoTrabajo
);