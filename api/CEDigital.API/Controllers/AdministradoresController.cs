using Microsoft.AspNetCore.Mvc;
using CEDigital.API.Models;
using CEDigital.API.Services;
using MongoDB.Driver;

namespace CEDigital.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdministradoresController : ControllerBase
    {
        private readonly MongoDbService _mongoDbService;
        private readonly IMongoCollection<Administrador> _administradores;

        public AdministradoresController(MongoDbService mongoDbService)
        {
            _mongoDbService = mongoDbService;
            _administradores = _mongoDbService.GetCollection<Administrador>("administradores");
        }

        [HttpGet]
        public async Task<ActionResult<List<Administrador>>> Get()
        {
            return await _administradores.Find(_ => true).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Administrador>> Get(string id)
        {
            var admin = await _administradores.Find(e => e.Id == id).FirstOrDefaultAsync();
            if (admin == null)
                return NotFound();
            return admin;
        }

        [HttpPost]
        public async Task<ActionResult<Administrador>> Create(Administrador admin)
        {
            admin.Password = PasswordHelper.ToMD5(admin.Password ?? "");
            await _administradores.InsertOneAsync(admin);
            return CreatedAtAction(nameof(Get), new { id = admin.Id }, admin);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, Administrador admin)
        {
            var result = await _administradores.ReplaceOneAsync(e => e.Id == id, admin);
            if (result.ModifiedCount == 0)
                return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var result = await _administradores.DeleteOneAsync(e => e.Id == id);
            if (result.DeletedCount == 0)
                return NotFound();
            return NoContent();
        }
    }
} 