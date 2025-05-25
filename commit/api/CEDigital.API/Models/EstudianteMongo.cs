using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CEDigital.API.Models
{
    public class EstudianteMongo
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = "";

        [BsonElement("carne")]
        public long Carne { get; set; }

        [BsonElement("cedula")]
        public long Cedula { get; set; }

        [BsonElement("nombre")]
        public string Nombre { get; set; } = "";

        [BsonElement("correo")]
        public string Correo { get; set; } = "";

        [BsonElement("telefono")]
        public long Telefono { get; set; }

        [BsonElement("password")]
        public string Password { get; set; } = "";
    }
}
