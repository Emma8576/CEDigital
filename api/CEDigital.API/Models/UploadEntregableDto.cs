using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace CEDigital.API.Models
{
    public class UploadEntregableDto
    {
        [Required]
        public required IFormFile File { get; set; }

        [Required]
        public required int IdEvaluacion { get; set; }

        [Required]
        public required string CarnetEstudiante { get; set; }

        public int? IdGrupoTrabajo { get; set; }
    }

    public class UploadEspecificacionDto
    {
        [Required]
        public required IFormFile File { get; set; }

        [Required]
        public required int IdEvaluacion { get; set; }

    }
} 