using System.ComponentModel.DataAnnotations;

namespace CEDigital.API.Models
{
    public class SemestreUpdateDto
    {
        [Required]
        public required string Periodo { get; set; }

        [Required]
        public required int Año { get; set; }

        // Propiedades que podrían no ser directas columnas de la tabla Semestre, pero necesarias para la actualización
        public string? CodigoCurso { get; set; }
        public int? IdSemestreNavigation { get; set; }
    }
} 