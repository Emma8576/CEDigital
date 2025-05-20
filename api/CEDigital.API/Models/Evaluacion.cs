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
        [ForeignKey("Rubro")]
        public int IdRubro { get; set; }
        public required Rubro IdRubroNavigation { get; set; }

        [Required]
        public required string NombreEvaluacion { get; set; }

        public DateTime FechaHoraLimite { get; set; }

        public decimal ValorPorcentual { get; set; }

        public bool EsGrupal { get; set; }

        public bool TieneEntregable { get; set; }

        public int? CantEstudiantesGrupo { get; set; }

        public string? RutaEspecificacion { get; set; }

        public required ICollection<Entrega> Entregas { get; set; } = new List<Entrega>();
        public required ICollection<NotaEvaluacion> NotaEvaluaciones { get; set; } = new List<NotaEvaluacion>();
    }
} 