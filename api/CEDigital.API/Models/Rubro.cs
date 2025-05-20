using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace CEDigital.API.Models
{
    public class Rubro
    {
        [Key]
        public int IdRubro { get; set; }

        [Required]
        public required string NombreRubro { get; set; }

        [Required]
        public decimal Porcentaje { get; set; }

        [Required]
        [ForeignKey("Grupo")]
        public int IdGrupo { get; set; }

        public required Grupo Grupo { get; set; }

        public ICollection<Evaluacion> Evaluaciones { get; set; } = new List<Evaluacion>();
    }
} 