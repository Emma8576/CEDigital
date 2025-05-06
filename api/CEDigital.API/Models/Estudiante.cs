using MongoDB.Bson.Serialization.Attributes;

namespace CEDigital.API.Models
{
    public class Estudiante : BasePerson
    {
        [BsonElement("carne")]
        public string? Carne { get; set; }

        [BsonElement("telefono")]
        public string? Telefono { get; set; }
    }
} 