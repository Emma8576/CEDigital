using CEDigital.API.Configuration;
using CEDigital.API.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace CEDigital.API.Services
{
    public class EstudianteMongoService
    {
        private readonly IMongoCollection<EstudianteMongo> _estudiantes;

        public EstudianteMongoService(IOptions<MongoDbSettings> mongoSettings)
        {
            var client = new MongoClient(mongoSettings.Value.ConnectionString);
            var database = client.GetDatabase(mongoSettings.Value.DatabaseName);
            _estudiantes = database.GetCollection<EstudianteMongo>("Estudiantes");
        }

        public async Task<List<EstudianteMongo>> GetEstudiantesAsync()
        {
            return await _estudiantes.Find(_ => true).ToListAsync();
        }

        public async Task CrearEstudianteAsync(EstudianteMongo estudiante)
        {
            await _estudiantes.InsertOneAsync(estudiante);
        }

        public async Task<EstudianteMongo?> GetEstudiantePorCarneAsync(long carne)
        {
            return await _estudiantes.Find(e => e.Carne == carne).FirstOrDefaultAsync();
        }
    }
}
