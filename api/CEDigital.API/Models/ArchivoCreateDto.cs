namespace CEDigital.API.Models
{
    public class ArchivoCreateDto
    {
        public string NombreArchivo { get; set; }
        public int TamañoArchivo { get; set; }
        public int IdCarpeta { get; set; }
        public string Ruta { get; set; }
    }
} 