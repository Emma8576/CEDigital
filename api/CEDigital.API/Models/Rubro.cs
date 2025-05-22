using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CEDigital.API.Models
{
    public class Rubro
    {
        [Key]
        public int IdRubro { get; set; }

        [Required]
        [MaxLength(100)]
        public string NombreRubro { get; set; }

        [Required]
        public int Porcentaje { get; set; }

        [Required]
        [ForeignKey("Grupo")]
        public int IdGrupo { get; set; }

        public Grupo Grupo { get; set; }
    }

    public class RubroCreateDto
    {
        public string NombreRubro { get; set; }
        public int Porcentaje { get; set; }
        public int IdGrupo { get; set; }
    }

    public class RubroDto
    {
        public int IdRubro { get; set; }
        public string NombreRubro { get; set; }
        public int Porcentaje { get; set; }
        public int IdGrupo { get; set; }
    }

    public class RubroUpdateDto
    {
        public string NombreRubro { get; set; }
        public int Porcentaje { get; set; }
    }

}