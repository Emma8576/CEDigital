using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CEDigital.API.Models
{
    public class NotaEvaluacion
    {
        [Key]
        public int IdNotaEvaluacion { get; set; }

        public decimal PorcentajeObtenido { get; set; }
        public string? Observaciones { get; set; }
        public string? RutaArchivoDetalles { get; set; }
        public bool Publicada { get; set; }

        [Required]
        [ForeignKey("Evaluacion")]
        public int IdEvaluacion { get; set; }
        public required Evaluacion IdEvaluacionNavigation { get; set; }

        [ForeignKey("GrupoTrabajo")]
        public int? IdGrupoTrabajo { get; set; }
        public required GrupoTrabajo IdGrupoTrabajoNavigation { get; set; }
    }
} 