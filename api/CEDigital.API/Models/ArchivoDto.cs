using System;

namespace CEDigital.API.Models
{
    public class ArchivoDto
    {
        public int IdArchivo { get; set; }
        public required string NombreArchivo { get; set; }
        public DateTime FechaPublicacion { get; set; }
        public long TamañoArchivo { get; set; }
        public int IdCarpeta { get; set; }
        public string? Descripcion { get; set; }
        public required string Ruta { get; set; } // O solo el nombre del archivo si la ruta es interna
    }
} 