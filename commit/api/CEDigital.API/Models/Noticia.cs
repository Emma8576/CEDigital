using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CEDigital.API.Models
{
    public class Noticia
    {
        [Key]
        public int IdNoticia { get; set; }

        [Required]
        public required string Titulo { get; set; }

        [Required]
        public required string Mensaje { get; set; }

        public DateTime FechaPublicacion { get; set; }

        [Required]
        [ForeignKey("Grupo")]
        public int IdGrupo { get; set; }
        public required Grupo Grupo { get; set; }
    }

    public class NoticiaCreateDto
    {
        public string Titulo { get; set; }
        public string Mensaje { get; set; }
        public int IdGrupo { get; set; }
    }

    public class NoticiaDto
    {
        public int IdNoticia { get; set; }
        public string Titulo { get; set; }
        public string Mensaje { get; set; }
        public DateTime FechaPublicacion { get; set; }
        public int IdGrupo { get; set; }
    }
}
