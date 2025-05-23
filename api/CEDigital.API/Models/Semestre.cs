using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CEDigital.API.Models
{
    public class Semestre
    {
        [Key]
        public int IdSemestre { get; set; }

        [Required]
        public string Periodo { get; set; } // "1", "2", "V"

        [Required]
        public int Año { get; set; }

        public virtual ICollection<Grupo> Grupos { get; set; } = new List<Grupo>();
    }

    public class SemestreCantidadGruposDto
    {
        [Key]
        public int IdSemestre { get; set; }
        public string Periodo { get; set; } // "1", "2", "V"
        public int Año { get; set; }
        public int CantidadGrupos { get; set; }
    }
}
