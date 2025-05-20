using System.ComponentModel.DataAnnotations;

namespace CEDigital.API.Models
{
    public class SemestreUpdateDto
    {
        [Required]
        public required string Periodo { get; set; }

        [Required]
        public required string CodigoCurso { get; set; }

        public int? IdSemestreNavigation { get; set; }
    }
} 