using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CEDigital.API.Models
{
    public class Semestre
    {
        [Key]
        public int IdSemestre { get; set; }

        [Required]
        public required string Periodo { get; set; }

        [Required]
        public required string Año { get; set; }

        [Required]
        public required string CodigoCurso { get; set; }

        [ForeignKey("Curso")]
        public required string CodigoCursoNavigation { get; set; }
        public required Curso Curso { get; set; }

        [ForeignKey("Semestre")]
        public int? IdSemestreNavigation { get; set; }
        public Semestre? SemestreNavigation { get; set; }

        public ICollection<Semestre>? Semestres { get; set; }
    }
}
