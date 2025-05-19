using System.ComponentModel.DataAnnotations;

namespace CEDigital.API.Models
{
    public class Semestre
    {
        [Key]
        public int IdSemestre { get; set; } 
        public string Periodo { get; set; } // "1", "2", "V"
        public int Año { get; set; }
    }

    public class SemestreUpdateDto
    {
        public string Periodo { get; set; }
        public int Año { get; set; }
    }

    public class SemestreCreateDto
    {
        public string Periodo { get; set; }
        public int Año { get; set; }
    }
}
