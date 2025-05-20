using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CEDigital.API.Models
{
    [BsonIgnoreExtraElements]
    public class Estudiante
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("nombre")]
        [Required]
        public required string Nombre { get; set; }

        [BsonElement("correo")]
        [Required]
        public required string Correo { get; set; }

        [BsonElement("password")]
        [Required]
        public required string Password { get; set; }

        [BsonElement("carne")]
        [Required]
        public required string Carnet { get; set; }

        [BsonElement("telefono")]
        public string? Telefono { get; set; }
    }
} 