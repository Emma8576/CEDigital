using CEDigital.API.Configuration;
using CEDigital.API.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace CEDigital.API.Services
{
    public class EstudianteMongoService
    {
        private readonly IMongoCollection<Estudiante> _estudiantes;

        public EstudianteMongoService(IOptions<MongoDbSettings> mongoSettings)
        {
            var client = new MongoClient(mongoSettings.Value.ConnectionString);
            var database = client.GetDatabase(mongoSettings.Value.DatabaseName);
            _estudiantes = database.GetCollection<Estudiante>("Estudiantes");
        }

        public async Task<List<Estudiante>> GetEstudiantesAsync()
        {
            return await _estudiantes.Find(_ => true).ToListAsync();
        }

        public async Task CrearEstudianteAsync(Estudiante estudiante)
        {
            await _estudiantes.InsertOneAsync(estudiante);
        }

        public async Task<Estudiante?> GetEstudiantePorCarneAsync(string carne)
        {
            return await _estudiantes.Find(e => e.Carnet == carne).FirstOrDefaultAsync();
        }
    }
}
