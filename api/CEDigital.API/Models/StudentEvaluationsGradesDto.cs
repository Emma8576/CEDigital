namespace CEDigital.API.Models
{
    public class StudentEvaluationsGradesDto
    {
        public required string NombreEstudiante { get; set; }
        public decimal NotaTotal { get; set; } // Nota final calculada
        public List<RubricWithEvaluationsDto> Rubros { get; set; } = new List<RubricWithEvaluationsDto>();
    }

    public class RubricWithEvaluationsDto
    {
        public int IdRubro { get; set; }
        public required string NombreRubro { get; set; }
        public int PorcentajeRubro { get; set; }
        public List<EvaluationWithGradeDto> Evaluaciones { get; set; } = new List<EvaluationWithGradeDto>();
    }

    public class EvaluationWithGradeDto
    {
        public int IdEvaluacion { get; set; }
        public required string NombreEvaluacion { get; set; }
        public DateTime FechaHoraLimite { get; set; }
        public decimal ValorPorcentualEvaluacion { get; set; } // Valor de esta evaluacin dentro del rubro
        public bool EsGrupal { get; set; }
        public bool TieneEntregable { get; set; }
        public int? CantEstudiantesGrupo { get; set; }
        public string? RutaEspecificacion { get; set; }

        // Detalles de la nota del estudiante para esta evaluacin
        public decimal? PorcentajeObtenido { get; set; } // Null si no hay nota
        public string? Observaciones { get; set; }
        public string? RutaArchivoDetalles { get; set; }
        public bool Publicada { get; set; } // Indica si la nota ha sido publicada

        // TODO: Add deliverable status/details if needed later
    }
} 