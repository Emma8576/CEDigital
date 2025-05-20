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
        public required string NombreArchivo { get; set; }

        public string? Descripcion { get; set; }

        public DateTime FechaSubida { get; set; }

        public long TamañoArchivo { get; set; }

        [Required]
        [ForeignKey("Carpeta")]
        public int IdCarpeta { get; set; }
        public required Carpeta Carpeta { get; set; }

        [Required]
        public required string Ruta { get; set; }
    }
} 