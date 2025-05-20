using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CEDigital.API.Models
{
    public class Semestre
    {
        [Key]
        public int IdSemestre { get; set; }

        [Required]
        public required string Periodo { get; set; }

        [Required]
        public required int Año { get; set; }
    }
}
