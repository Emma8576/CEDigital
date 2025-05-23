using CEDigital.API.Configuration;
using CEDigital.API.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace CEDigital.API.Services
{
    public class EstudianteMongoService
    {
        private readonly IMongoCollection<EstudianteMongo> _estudiantesCollection;
        //Se hace conexion con Mongo y se obtiene la colección estudiantes
        public EstudianteMongoService(IOptions<MongoDbSettings> mongoSettings)
        {
            var mongoClient = new MongoClient(mongoSettings.Value.ConnectionString);
            var mongoDatabase = mongoClient.GetDatabase(mongoSettings.Value.DatabaseName);

            _estudiantesCollection = mongoDatabase.GetCollection<EstudianteMongo>("Estudiantes");
        }
        //Obtiene todo los estudiantes
        public async Task<List<EstudianteMongo>> GetEstudiantesAsync() =>
            await _estudiantesCollection.Find(_ => true).ToListAsync();
        //Obtiene un estudiante por ID
        public async Task<EstudianteMongo> GetEstudianteByIdAsync(string id) =>
            await _estudiantesCollection.Find(e => e.Id == id).FirstOrDefaultAsync();
        //Se crea un nuevo estudiantes en Estudiantes
        public async Task CrearEstudianteAsync(EstudianteMongo estudiante)
        {
            await _estudiantesCollection.InsertOneAsync(estudiante);
        }
        //Actualiza Estudiantes
        public async Task<bool> UpdateEstudianteAsync(string id, EstudianteMongo estudiante)
        {
            var result = await _estudiantesCollection.ReplaceOneAsync(e => e.Id == id, estudiante);
            return result.ModifiedCount > 0;
        }
        //Elimina un estudiantes por su Id en mongo
        public async Task<bool> DeleteEstudianteAsync(string id)
        {
            var result = await _estudiantesCollection.DeleteOneAsync(e => e.Id == id);
            return result.DeletedCount > 0;
        }
    }
}