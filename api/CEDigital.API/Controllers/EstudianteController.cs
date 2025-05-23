using Microsoft.AspNetCore.Mvc;
using CEDigital.API.Services;
using CEDigital.API.Models;

namespace CEDigital.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EstudianteController : ControllerBase
    {
        private readonly EstudianteMongoService _estudianteService;

        public EstudianteController(EstudianteMongoService estudianteService)
        {
            _estudianteService = estudianteService;
        }

        [HttpGet]
        public async Task<ActionResult<List<Estudiante>>> Get()
        {
            var estudiantes = await _estudianteService.GetEstudiantesAsync();
            return Ok(estudiantes);
        }

        [HttpGet("{carne}")]
        public async Task<ActionResult<Estudiante>> GetPorCarne(string carne)
        {
            var estudiante = await _estudianteService.GetEstudiantePorCarneAsync(carne);
            if (estudiante == null)
                return NotFound();
            return Ok(estudiante);
        }

        [HttpPost]
        public async Task<ActionResult> Post(Estudiante estudiante)
        {
            await _estudianteService.CrearEstudianteAsync(estudiante);
            return CreatedAtAction(nameof(GetPorCarne), new { carne = estudiante.Carne }, estudiante);
        }
    }
}
