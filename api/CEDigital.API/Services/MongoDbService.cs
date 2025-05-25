using MongoDB.Driver;
using CEDigital.API.Configuration;
using CEDigital.API.Models;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;

namespace CEDigital.API.Services
{
    public class MongoDBService
    {
        private readonly IMongoDatabase _database;

        public MongoDBService(IOptions<MongoDbSettings> settings)
        {
            var client = new MongoClient(settings.Value.ConnectionString);
            _database = client.GetDatabase(settings.Value.DatabaseName);
        }

        public IMongoCollection<T> GetCollection<T>(string collectionName) where T : class
        {
            return _database.GetCollection<T>(collectionName);
        }

        public async Task<Models.Estudiante?> GetStudentByCarnetAsync(string carnet)
        {
            var collection = _database.GetCollection<Models.Estudiante>("Estudiantes"); // Assuming collection name is "Estudiantes"
            var filter = Builders<Models.Estudiante>.Filter.Eq(s => s.Carne, carnet);
            return await collection.Find(filter).FirstOrDefaultAsync();
        }

        public async Task<Models.Profesor?> GetProfesorByCarnetAsync(string cedula)
        {
            var collection = _database.GetCollection<Models.Profesor>("profesores"); // Assuming collection name is "Profesores"
            var filter = Builders<Models.Profesor>.Filter.Eq(s => s.Cedula, cedula);
            return await collection.Find(filter).FirstOrDefaultAsync();
        }
    }
}