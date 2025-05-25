using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CEDigital.API.Models
{
    public class Carrera
    {   
        [Key]
        public int IdCarrera { get; set; }

        [Required]
        public required string NombreCarrera { get; set; }
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
