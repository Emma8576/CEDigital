using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CEDigital.API.Models
{
    public class EstudianteGrupo
    {
        [Required]
        public required string CarnetEstudiante { get; set; }

        [Required]
        [ForeignKey("Grupo")]
        public int IdGrupo { get; set; }
        public required Grupo Grupo { get; set; }
    }

    public class EstudianteGrupoDto
    {
        public int IdGrupo { get; set; }
        public string CarnetEstudiante { get; set; }
    }


    public class EstudianteGrupoCreateDto
    {
        public int IdGrupo { get; set; }
        public List<string> CarnetsEstudiantes { get; set; }
    }
}