using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CEDigital.API.Models
{
    public class Curso
    {
        [Key]
        public string CodigoCurso { get; set; }

        [Required]
        public string NombreCurso { get; set; }

        [Required]
        public int Creditos { get; set; }

        [Required]
        public int IdCarrera { get; set; }

        [ForeignKey("IdCarrera")]
        public Carrera Carrera { get; set; }
    }

    public class CursoCreateDto
    {
        public string CodigoCurso { get; set; }
        public string NombreCurso { get; set; }
        public int Creditos { get; set; }
        public int IdCarrera { get; set; }
    }

    public class CursoUpdateDto
    {
        public string NombreCurso { get; set; }
        public int Creditos { get; set; }
        public int IdCarrera { get; set; }
    }

    public class CursoEstudianteDto
    {
        public string CodigoCurso { get; set; }
        public string NombreCurso { get; set; }
        public int NumeroGrupo { get; set; }
        public string Semestre { get; set; }
        public string Periodo { get; set; }
    }

}
