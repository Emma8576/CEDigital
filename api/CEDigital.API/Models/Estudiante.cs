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

        [BsonElement("cedula")]
        public string? Cedula { get; set; }

        [BsonElement("nombre")]
        public string? Nombre { get; set; }

        [BsonElement("correo")]
        public string? Correo { get; set; }

        [BsonElement("password")]
        public string? Password { get; set; }

        [BsonElement("carne")]
        public string? Carne { get; set; }

        [BsonElement("telefono")]
        public string? Telefono { get; set; }
    }
} 
