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
        public string CodigoCurso { get; set; }

        [Required]
        [ForeignKey("Semestre")]
        public int IdSemestre { get; set; }

        [Required]
        public int NumeroGrupo { get; set; }

        public Curso Curso { get; set; }
        public Semestre Semestre { get; set; }
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

}
