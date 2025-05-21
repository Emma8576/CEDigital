using MongoDB.Driver;
using CEDigital.API.Models;

namespace CEDigital.API.Services
{
    public class ProfesorMongoService
    {
        private readonly IMongoCollection<ProfesorMongo> _profesores;

        public ProfesorMongoService(MongoDbService mongoService)
        {
            _profesores = mongoService.GetCollection<ProfesorMongo>("Profesores");
        }

        public async Task<List<ProfesorMongo>> GetProfesoresAsync()
        {
            return await _profesores.Find(_ => true).ToListAsync();
        }
    }
}
