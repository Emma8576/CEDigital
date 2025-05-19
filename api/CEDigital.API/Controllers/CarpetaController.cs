using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CEDigital.API.Models;
using CEDigital.API.Data;

namespace CEDigital.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CarpetaController : ControllerBase
    {
        private readonly CEDigitalContext _context;

        public CarpetaController(CEDigitalContext context)
        {
            _context = context;
        }

        // GET: api/Carpeta/grupo/5
        [HttpGet("grupo/{idGrupo}")] //busca las carpetas relacionadas a un IdGrupo
        public async Task<ActionResult<List<CarpetaDto>>> GetCarpetasPorGrupo(int idGrupo)
        {
            var carpetas = await _context.Carpetas
                .Where(c => c.IdGrupo == idGrupo)
                .Select(c => new CarpetaDto
                {
                    IdCarpeta = c.IdCarpeta,
                    NombreCarpeta = c.NombreCarpeta,
                    IdGrupo = c.IdGrupo
                })
                .ToListAsync();

            return carpetas;
        }

        // POST: api/Carpeta
        [HttpPost] // permite crear una nueva carpeta
        public async Task<IActionResult> CrearCarpeta(CarpetaCreateDto dto)
        {
            var carpeta = new Carpeta
            {
                NombreCarpeta = dto.NombreCarpeta,
                IdGrupo = dto.IdGrupo
            };

            _context.Carpetas.Add(carpeta);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCarpetasPorGrupo), new { idGrupo = dto.IdGrupo }, null);
        }

        // PUT: api/Carpeta/5
        [HttpPut("{id}")] // Permite modificar el nombre de una carpeta segun su id
        public async Task<IActionResult> ActualizarCarpeta(int id, CarpetaUpdateDto dto)
        {
            var carpeta = await _context.Carpetas.FindAsync(id);
            if (carpeta == null)
                return NotFound();

            carpeta.NombreCarpeta = dto.NombreCarpeta;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Carpeta/5
        [HttpDelete("{id}")] // elimina una carpeta según su id, no borra Presentaciones, Quices, Exámenes y Proyectos
        public async Task<IActionResult> EliminarCarpeta(int id)
        {
            var carpeta = await _context.Carpetas.FindAsync(id);
            if (carpeta == null)
                return NotFound();

            var nombresProtegidos = new[] { "Presentaciones", "Quices", "Exámenes", "Proyectos" };

            if (nombresProtegidos.Contains(carpeta.NombreCarpeta))
                return BadRequest($"La carpeta \"{carpeta.NombreCarpeta}\" no se puede eliminar porque es una carpeta protegida.");

            _context.Carpetas.Remove(carpeta);
            await _context.SaveChangesAsync();

            return NoContent();
        }

    }
}
