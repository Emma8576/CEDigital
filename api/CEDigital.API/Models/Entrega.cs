using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CEDigital.API.Models
{
    public class Entrega
    {
        [Key]
        public int IdEntrega { get; set; }

        [Required]
        [ForeignKey("Evaluacion")]
        public int IdEvaluacion { get; set; }
        public required Evaluacion Evaluacion { get; set; }

        [ForeignKey("GrupoTrabajo")]
        public int? IdGrupoTrabajo { get; set; }
        public required GrupoTrabajo GrupoTrabajo { get; set; }

        public string? CarnetEstudiante { get; set; }

        public DateTime FechaEntrega { get; set; }

        [Required]
        public required string RutaEntregable { get; set; }

        // TODO: Add other relevant properties like file name, file type, etc.
    }
} 