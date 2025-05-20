using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CEDigital.API.Models
{
    public class NotaEvaluacion
    {
        [Key]
        public int IdNotaEvaluacion { get; set; }

        [Required]
        [Column(TypeName = "decimal(5,2)")]
        public decimal PorcentajeObtenido { get; set; }

        [StringLength(500)]
        public string? Observaciones { get; set; }

        [StringLength(500)]
        public string? RutaArchivoDetalles { get; set; }

        [Required]
        public bool Publicada { get; set; }

        [Required]
        public int IdEvaluacion { get; set; }

        public string? CarnetEstudiante { get; set; }

        public int? IdGrupoTrabajo { get; set; }

        [ForeignKey("IdEvaluacion")]
        public Evaluacion Evaluacion { get; set; }

        [ForeignKey("IdGrupoTrabajo")]
        public GrupoTrabajo? GrupoTrabajo { get; set; }
    }

    public class NotaEvaluacionDto
    {
        public int IdNotaEvaluacion { get; set; }
        public decimal PorcentajeObtenido { get; set; }
        public string? Observaciones { get; set; }
        public string? RutaArchivoDetalles { get; set; }
        public bool Publicada { get; set; }
        public int IdEvaluacion { get; set; }
        public string? CarnetEstudiante { get; set; }
        public int? IdGrupoTrabajo { get; set; }
    }

    public class NotaEvaluacionCreateDto
    {
        public decimal PorcentajeObtenido { get; set; }
        public string? Observaciones { get; set; }
        public string? RutaArchivoDetalles { get; set; }
        public bool Publicada { get; set; }
        public int IdEvaluacion { get; set; }
        public string? CarnetEstudiante { get; set; }
        public int? IdGrupoTrabajo { get; set; }
    }

    public class NotaEvaluacionUpdateDto
    {
        public decimal PorcentajeObtenido { get; set; }
        public string? Observaciones { get; set; }
        public string? RutaArchivoDetalles { get; set; }
        public bool Publicada { get; set; }
    }
}
