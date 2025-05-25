using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace CEDigital.API.Models
{
    public class Evaluacion
    {
        [Key]
        public int IdEvaluacion { get; set; }

        [Required]
        public int IdRubro { get; set; }

        [Required]
        [StringLength(100)]
        public string NombreEvaluacion { get; set; }

        [Required]
        public DateTime FechaHoraLimite { get; set; }

        [Required]
        public int ValorPorcentual { get; set; }

        [Required]
        public bool EsGrupal { get; set; }

        [Required]
        public bool TieneEntregable { get; set; }

        [Required]
        public int CantEstudiantesGrupo { get; set; }

        [StringLength(500)]
        public string RutaEspecificacion { get; set; }

        [ForeignKey("IdRubro")]
        public Rubro Rubro { get; set; }

        public ICollection<NotaEvaluacion> NotaEvaluaciones { get; set; }
    }

    public class EvaluacionCreateDto
    {
        public int IdRubro { get; set; }
        public string NombreEvaluacion { get; set; }
        public DateTime FechaHoraLimite { get; set; }
        public int ValorPorcentual { get; set; }
        public bool EsGrupal { get; set; }
        public bool TieneEntregable { get; set; }
        public int CantEstudiantesGrupo { get; set; }
        public string RutaEspecificacion { get; set; }
    }

    public class EvaluacionUpdateDto
    {
        public string NombreEvaluacion { get; set; }
        public DateTime FechaHoraLimite { get; set; }
        public int ValorPorcentual { get; set; }
        public bool EsGrupal { get; set; }
        public bool TieneEntregable { get; set; }
        public int CantEstudiantesGrupo { get; set; }
        public string? RutaEspecificacion { get; set; }
    }
}
