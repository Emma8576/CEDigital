using System;
using CEDigital.API.Models;

namespace CEDigital.API.Models
{
    public class EvaluacionDto
    {
        public int IdEvaluacion { get; set; }
        public int IdRubro { get; set; }
        public string NombreEvaluacion { get; set; }
        public DateTime FechaHoraLimite { get; set; }
        public decimal ValorPorcentual { get; set; }
        public bool EsGrupal { get; set; }
        public bool TieneEntregable { get; set; }
        public int? CantEstudiantesGrupo { get; set; }
        public string RutaEspecificacion { get; set; }
        public Rubro IdRubroNavigation { get; set; }
    }
} 