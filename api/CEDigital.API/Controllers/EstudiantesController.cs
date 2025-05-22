using Microsoft.AspNetCore.Mvc;
using CEDigital.API.Models;
using CEDigital.API.Services;
using MongoDB.Driver;

namespace CEDigital.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EstudiantesController : ControllerBase
    {
        private readonly EstudianteMongoService _estudianteService;

        public EstudiantesController(EstudianteMongoService estudianteService)
        {
            _estudianteService = estudianteService;
        }

        [HttpGet]
        public async Task<ActionResult<List<EstudianteMongo>>> Get()
        {
            var estudiantes = await _estudianteService.GetEstudiantesAsync();
            return Ok(estudiantes);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<EstudianteMongo>> Get(string id)
        {
            var estudiante = await _estudianteService.GetEstudianteByIdAsync(id);
            if (estudiante == null)
                return NotFound();
            return Ok(estudiante);
        }

        [HttpPost]
        public async Task<ActionResult<EstudianteMongo>> Create(EstudianteMongo estudiante)
        {
            await _estudianteService.CrearEstudianteAsync(estudiante);
            return CreatedAtAction(nameof(Get), new { id = estudiante.Id }, estudiante);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, EstudianteMongo estudiante)
        {
            var updated = await _estudianteService.UpdateEstudianteAsync(id, estudiante);
            if (!updated)
                return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var deleted = await _estudianteService.DeleteEstudianteAsync(id);
            if (!deleted)
                return NotFound();
            return NoContent();
        }
    }
}
