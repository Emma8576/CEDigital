using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CEDigital.API.Models
{
    public class Archivo
    {
        [Key]
        public int IdArchivo { get; set; }

        [Required]
        [MaxLength(255)]
        public string NombreArchivo { get; set; }

        [Required]
        public DateTime FechaPublicacion { get; set; }

        [Required]
        public int TamañoArchivo { get; set; }

        [Required]
        [ForeignKey("Carpeta")]
        public int IdCarpeta { get; set; }

        [MaxLength(500)]
        public string Ruta { get; set; }

        public Carpeta Carpeta { get; set; }
    }

    public class ArchivoCreateDto
    {
        public string NombreArchivo { get; set; }
        public int TamañoArchivo { get; set; }
        public int IdCarpeta { get; set; }
        public string Ruta { get; set; }
    }

    public class ArchivoDto
    {
        public int IdArchivo { get; set; }
        public string NombreArchivo { get; set; }
        public DateTime FechaPublicacion { get; set; }
        public int TamañoArchivo { get; set; }
        public int IdCarpeta { get; set; }
        public string Ruta { get; set; }
    }
}
