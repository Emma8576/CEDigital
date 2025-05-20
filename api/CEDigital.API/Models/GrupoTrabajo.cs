using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace CEDigital.API.Models
{
    public class GrupoTrabajo
    {
        [Key]
        public int IdGrupoTrabajo { get; set; }

        // Assuming a group is for a specific evaluation
        [Required]
        [ForeignKey("Evaluacion")]
        public int IdEvaluacion { get; set; }
        public required Evaluacion Evaluacion { get; set; }

        // Students in this group
        public required ICollection<EstudianteGrupoTrabajo> EstudianteGrupoTrabajo { get; set; } = new List<EstudianteGrupoTrabajo>();
        public required ICollection<Entrega> Entregas { get; set; } = new List<Entrega>(); // Assuming one delivery per group
        public required ICollection<NotaEvaluacion> NotaEvaluaciones { get; set; } = new List<NotaEvaluacion>(); // Assuming one note per group delivery

        [Required]
        public required string CarnetEstudiante { get; set; }
    }

    // Helper class for the many-to-many relationship between Estudiante and GrupoTrabajo
    public class EstudianteGrupoTrabajo
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [ForeignKey("GrupoTrabajo")]
        public int IdGrupoTrabajo { get; set; }
        public GrupoTrabajo GrupoTrabajo { get; set; }

        [Required]
        public string CarnetEstudiante { get; set; }
        // Assuming Estudiante model has a Carnet property that is unique/key
        // public Estudiante Estudiante { get; set; } // Navigation property if needed
    }
} 