using Microsoft.AspNetCore.Mvc;
using CEDigital.API.Models;
using CEDigital.API.Services;
using MongoDB.Driver;

namespace CEDigital.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProfesoresController : ControllerBase
    {
        private readonly MongoDbService _mongoDbService;
        private readonly IMongoCollection<Profesor> _profesores;

        public ProfesoresController(MongoDbService mongoDbService)
        {
            _mongoDbService = mongoDbService;
            _profesores = _mongoDbService.GetCollection<Profesor>("profesores");
        }

        [HttpGet]
        public async Task<ActionResult<List<Profesor>>> Get()
        {
            return await _profesores.Find(_ => true).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Profesor>> Get(string id)
        {
            var profesor = await _profesores.Find(e => e.Id == id).FirstOrDefaultAsync();
            if (profesor == null)
                return NotFound();
            return profesor;
        }

        [HttpPost]
        public async Task<ActionResult<Profesor>> Create(Profesor profesor)
        {
            profesor.Id = null;
            profesor.Password = PasswordHelper.ToMD5(profesor.Password ?? "");
            await _profesores.InsertOneAsync(profesor);
            return CreatedAtAction(nameof(Get), new { id = profesor.Id }, profesor);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, Profesor profesor)
        {
            var result = await _profesores.ReplaceOneAsync(e => e.Id == id, profesor);
            if (result.ModifiedCount == 0)
                return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var result = await _profesores.DeleteOneAsync(e => e.Id == id);
            if (result.DeletedCount == 0)
                return NotFound();
            return NoContent();
        }
    }
} 