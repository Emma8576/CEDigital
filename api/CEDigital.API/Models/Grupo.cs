using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CEDigital.API.Models
{
    public class Grupo
    {
        [Key]
        public int IdGrupo { get; set; }

        [Required]
        [ForeignKey("Curso")]
        public required string CodigoCurso { get; set; }
        public required Curso Curso { get; set; }

        [Required]
        [ForeignKey("Semestre")]
        public int IdSemestre { get; set; }
        public required Semestre Semestre { get; set; }

        [Required]
        public int NumeroGrupo { get; set; }

        public required ICollection<EstudianteGrupo> Estudiantes { get; set; } = new List<EstudianteGrupo>();
    }

    public class GrupoCreateDto
    {
        public string CodigoCurso { get; set; }
        public int IdSemestre { get; set; }
        public int NumeroGrupo { get; set; }
    }

    public class GrupoBasicDto
    {
        public int IdGrupo { get; set; }
        public string CodigoCurso { get; set; }
        public int IdSemestre { get; set; }
        public int NumeroGrupo { get; set; }
    }

    public class GrupoUpdateDto
    {
        public string CodigoCurso { get; set; }
        public int IdSemestre { get; set; }
        public int NumeroGrupo { get; set; }
    }

    public class GrupoDto
    {
        public int IdGrupo { get; set; }
        public string CodigoCurso { get; set; }
        public int IdSemestre { get; set; }
        public int NumeroGrupo { get; set; }

        public List<EstudianteGrupoDto> Estudiantes { get; set; }
    }
}
