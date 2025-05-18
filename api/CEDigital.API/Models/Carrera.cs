using System.ComponentModel.DataAnnotations;

namespace CEDigital.API.Models
{
    public class Carrera
    {   
        [Key]
        public int IdCarrera { get; set; }
        public string NombreCarrera { get; set; } = null!;
    }

    public class CarreraCreateDto
    {
        public string NombreCarrera { get; set; }
    }

    public class CarreraUpdateDto
    {
        public string NombreCarrera { get; set; }
    }


}
