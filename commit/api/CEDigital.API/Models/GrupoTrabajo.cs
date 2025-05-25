using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CEDigital.API.Models
{
     public class GrupoTrabajo
    {
        public string CarnetEstudiante { get; set; } = null!;

        public int IdGrupoTrabajo { get; set; }

        public int IdEvaluacion { get; set; }

        public ICollection<Entrega> Entregas { get; set; }
        public ICollection<NotaEvaluacion>? NotasEvaluacion { get; set; }
    }

    public class GrupoTrabajoCreateDto
    {
        public string CarnetEstudiante { get; set; } = null!;
        public int IdGrupoTrabajo { get; set; }
        public int IdEvaluacion { get; set; }
    }
  
        public class GrupoTrabajoDto
    {
        public string CarnetEstudiante { get; set; } = null!;
        public int IdGrupoTrabajo { get; set; }
        public int IdEvaluacion { get; set; }
    }

}
