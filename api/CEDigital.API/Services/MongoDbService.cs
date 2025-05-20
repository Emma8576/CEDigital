using MongoDB.Driver;
using CEDigital.API.Configuration;
using CEDigital.API.Models;
using System.Threading.Tasks;

namespace CEDigital.API.Services
{
    public class MongoDBService
    {
        private readonly IMongoDatabase _database;

        public MongoDBService(MongoDbSettings settings)
        {
            var client = new MongoClient(settings.ConnectionString);
            _database = client.GetDatabase(settings.DatabaseName);
        }

        public IMongoCollection<T> GetCollection<T>(string collectionName) where T : class
        {
            return _database.GetCollection<T>(collectionName);
        }

        public async Task<Models.Estudiante> GetStudentByCarnetAsync(string carnet)
        {
            // Implement MongoDB logic here to retrieve the student by carnet
            // This is a placeholder and needs actual implementation
            var collection = _database.GetCollection<Models.Estudiante>("Estudiantes"); // Assuming collection name is "Estudiantes"
            var filter = Builders<Models.Estudiante>.Filter.Eq(s => s.Carnet, carnet);
            return await collection.Find(filter).FirstOrDefaultAsync();
        }
    }
}