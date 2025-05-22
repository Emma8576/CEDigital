using CEDigital.API.Models;
using CEDigital.API.Services;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System.Threading.Tasks;

namespace CEDigital.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EstudiantesController : ControllerBase
    {
        private readonly MongoDBService _mongoDbService;
        private readonly IMongoCollection<Estudiante> _estudiantes;

        public EstudiantesController(MongoDBService mongoDbService)
        {
            _mongoDbService = mongoDbService;
            _estudiantes = _mongoDbService.GetCollection<Estudiante>("estudiantes");
        }

        [HttpGet]
        public async Task<ActionResult<List<Estudiante>>> Get()
        {
            return await _estudiantes.Find(_ => true).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Estudiante>> Get(string id)
        {
            var estudiante = await _estudiantes.Find(e => e.Id == id).FirstOrDefaultAsync();
            if (estudiante == null)
                return NotFound();
            return estudiante;
        }

        [HttpGet("get-by-carnet/{carnet}")]
        public async Task<ActionResult<Estudiante>> GetByCarnet(string carnet)
        {
            var estudiante = await _estudiantes.Find(e => e.Carnet == carnet).FirstOrDefaultAsync();
            if (estudiante == null)
                return NotFound();
            return estudiante;
        }

        [HttpPost]
        public async Task<ActionResult<Estudiante>> Create(Estudiante estudiante)
        {
            estudiante.Id = null;
            estudiante.Password = PasswordHelper.ToMD5(estudiante.Password ?? "");
            await _estudiantes.InsertOneAsync(estudiante);
            return CreatedAtAction(nameof(Get), new { id = estudiante.Id }, estudiante);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, Estudiante estudiante)
        {
            var result = await _estudiantes.ReplaceOneAsync(e => e.Id == id, estudiante);
            if (result.ModifiedCount == 0)
                return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var result = await _estudiantes.DeleteOneAsync(e => e.Id == id);
            if (result.DeletedCount == 0)
                return NotFound();
            return NoContent();
        }
    }
} 