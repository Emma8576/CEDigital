using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CEDigital.API.Models
{
    public class Entrega
        {
            [Key]
            public int IdEntrega { get; set; }

            // FK a Evaluacion
            public int IdEvaluacion { get; set; }

            [ForeignKey("IdEvaluacion")]
            public Evaluacion Evaluacion { get; set; }

            public int? IdGrupoTrabajo { get; set; }

            public string? CarnetEstudiante { get; set; }

            public DateTime FechaEntrega { get; set; }

            public string? RutaEntregable { get; set; }
        }
    

    public class EntregaCreateDto
    {
        public int IdEvaluacion { get; set; }
        public int? IdGrupoTrabajo { get; set; }
        public string? CarnetEstudiante { get; set; }
        public DateTime FechaEntrega { get; set; }
        public string? RutaEntregable { get; set; }
    }

    public class EntregaDto
    {
        public int IdEntrega { get; set; }
        public int IdEvaluacion { get; set; }
        public int? IdGrupoTrabajo { get; set; }
        public string? CarnetEstudiante { get; set; }
        public DateTime FechaEntrega { get; set; }
        public string? RutaEntregable { get; set; }
    }

    public class EntregaUpdateDto
    {
        public DateTime FechaEntrega { get; set; }
        public string? RutaEntregable { get; set; }
    }

}