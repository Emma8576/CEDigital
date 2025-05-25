using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace CEDigital.API.Models
{
    public class Archivo
    {
        [Key]
        public int IdArchivo { get; set; }

        [Required]
        [MaxLength(255)]
        public required string NombreArchivo { get; set; }

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

    public class UploadArchivoDto
    {
        [Required]
        public required IFormFile File { get; set; }

        [Required]
        public required int IdCarpeta { get; set; }
    }
} 
