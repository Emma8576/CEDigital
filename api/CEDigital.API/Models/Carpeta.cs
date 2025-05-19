using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CEDigital.API.Models
{
    public class Carpeta
    {
        [Key]
        public int IdCarpeta { get; set; }

        [Required]
        [StringLength(50)]
        public string NombreCarpeta { get; set; }

        [Required]
        [ForeignKey("Grupo")]
        public int IdGrupo { get; set; }

        public Grupo Grupo { get; set; }
    }

        public class CarpetaCreateDto
    {
        public string NombreCarpeta { get; set; }
        public int IdGrupo { get; set; }
    }

    public class CarpetaDto
    {
        public int IdCarpeta { get; set; }
        public string NombreCarpeta { get; set; }
        public int IdGrupo { get; set; }
    }

    public class CarpetaUpdateDto
    {
        public string NombreCarpeta { get; set; }
    }
}
