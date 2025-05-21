using CEDigital.API.Configuration;
using CEDigital.API.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace CEDigital.API.Services
{
    public class ProfesorMongoService
    {
        private readonly IMongoCollection<ProfesorMongo> _profesoresCollection;

        public ProfesorMongoService(IOptions<MongoDbSettings> mongoSettings)
        {
            var mongoClient = new MongoClient(mongoSettings.Value.ConnectionString);
            var mongoDatabase = mongoClient.GetDatabase(mongoSettings.Value.DatabaseName);

            _profesoresCollection = mongoDatabase.GetCollection<ProfesorMongo>("Profesores");
        }

        public async Task<List<ProfesorMongo>> GetProfesoresAsync() =>
            await _profesoresCollection.Find(_ => true).ToListAsync();

        public async Task CrearProfesorAsync(ProfesorMongo profesor)
        {
            await _profesoresCollection.InsertOneAsync(profesor);
        }
    }
}
