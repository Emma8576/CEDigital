using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CEDigital.API.Models
{
    public class Curso
    {
        [Key]
        public required string CodigoCurso { get; set; }

        [Required]
        public required string NombreCurso { get; set; }

        [Required]
        public int Creditos { get; set; }

        [Required]
        [ForeignKey("Carrera")]
        public int IdCarrera { get; set; }
        public required Carrera Carrera { get; set; }
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
        public int IdGrupo { get; set; }
        public string CodigoCurso { get; set; }
        public string NombreCurso { get; set; }
        public int NumeroGrupo { get; set; }
        public int IdSemestre { get; set; }
        public int AñoSemestre { get; set; }
        public string PeriodoSemestre { get; set; }
    }

}
