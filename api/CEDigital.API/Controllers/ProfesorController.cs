using Microsoft.AspNetCore.Mvc;
using CEDigital.API.Models;
using CEDigital.API.Services;

namespace CEDigital.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProfesorController : ControllerBase
    {
        private readonly ProfesorMongoService _profesorService;

        public ProfesorController(ProfesorMongoService profesorService)
        {
            _profesorService = profesorService;
        }

        [HttpGet]
        public async Task<ActionResult<List<ProfesorMongo>>> GetProfesores()
        {
            var profesores = await _profesorService.GetProfesoresAsync();
            return Ok(profesores);
        }

        [HttpPost]
        public async Task<ActionResult> CrearProfesor([FromBody] ProfesorMongo nuevoProfesor)
        {
            Console.WriteLine("Llega al POST con: " + nuevoProfesor.Nombre);
            await _profesorService.CrearProfesorAsync(nuevoProfesor);
            return CreatedAtAction(nameof(GetProfesores), new { cedula = nuevoProfesor.Cedula }, nuevoProfesor);
        }


    }
}
