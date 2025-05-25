using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CEDigital.API.Models
{
    public class ProfesorGrupo
    {
        [Required]
        public required string CedulaProfesor { get; set; }

        [Required]
        [ForeignKey("Grupo")]
        public int IdGrupo { get; set; }
        public required Grupo Grupo { get; set; }
    }

    public class ProfesorGrupoCreateDto
    {
        public int IdGrupo { get; set; }
        public List<string> CedulasProfesores { get; set; }
    }

    public class ProfesorGrupoUpdateDto
    {
        public List<string> CedulasProfesores { get; set; }
    }
}