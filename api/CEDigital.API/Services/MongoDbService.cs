using MongoDB.Driver;
using CEDigital.API.Configuration;

namespace CEDigital.API.Services
{
    public class MongoDbService
    {
        private readonly IMongoDatabase _database;

        public MongoDbService(MongoDbSettings settings)
        {
            var client = new MongoClient(settings.ConnectionString);
            _database = client.GetDatabase(settings.DatabaseName);
        }

        public IMongoCollection<T> GetCollection<T>(string collectionName) where T : class
        {
            return _database.GetCollection<T>(collectionName);
        }
    }
}
