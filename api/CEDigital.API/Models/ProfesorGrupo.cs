using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CEDigital.API.Models
{
    public class ProfesorGrupo
    {
        public int IdGrupo { get; set; }
        public string CedulaProfesor { get; set; }
        
        public Grupo Grupo { get; set; }
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