using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CEDigital.API.Data;
using CEDigital.API.Models;

namespace CEDigital.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RubroController : ControllerBase
    {
        private readonly CEDigitalContext _context;

        public RubroController(CEDigitalContext context)
        {
            _context = context;
        }

     // POST: api/Rubro
        [HttpPost] //permite guardar un nuevo rubro (no que exceda el 100%)
        public async Task<ActionResult<Rubro>> PostRubro(RubroCreateDto dto)
        {
            // Calcular el total actual de porcentajes en el grupo
            int sumaActual = await _context.Rubros
                .Where(r => r.IdGrupo == dto.IdGrupo)
                .SumAsync(r => r.Porcentaje);

            // Verificar si se excede el 100%
            if (sumaActual + dto.Porcentaje > 100)
            {
                return BadRequest($"No se puede agregar este rubro porque la suma total de porcentajes para el grupo excedería 100%. Actualmente: {sumaActual}%.");
            }

            var rubro = new Rubro
            {
                NombreRubro = dto.NombreRubro,
                Porcentaje = dto.Porcentaje,
                IdGrupo = dto.IdGrupo
            };

            _context.Rubros.Add(rubro);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetRubro), new { id = rubro.IdRubro }, rubro);
        }


        // GET: api/Rubro/5
        [HttpGet("{id}")] //busca un rubro especifco usando su id
        public async Task<ActionResult<RubroDto>> GetRubro(int id)
        {
            var rubro = await _context.Rubros.FindAsync(id);

            if (rubro == null)
                return NotFound();

            return new RubroDto
            {
                IdRubro = rubro.IdRubro,
                NombreRubro = rubro.NombreRubro,
                Porcentaje = rubro.Porcentaje,
                IdGrupo = rubro.IdGrupo
            };
        }

        // GET: api/Rubro/grupo/5
        [HttpGet("grupo/{idGrupo}")] //busca los rubros que tiene un grupo (usa IdGrupo)
        public async Task<ActionResult<List<RubroDto>>> GetRubrosPorGrupo(int idGrupo)
        {
            var rubros = await _context.Rubros
                .Where(r => r.IdGrupo == idGrupo)
                .Select(r => new RubroDto
                {
                    IdRubro = r.IdRubro,
                    NombreRubro = r.NombreRubro,
                    Porcentaje = r.Porcentaje,
                    IdGrupo = r.IdGrupo
                })
                .ToListAsync();

            return rubros;
        }

        // DELETE: api/Rubro/5
        [HttpDelete("{id}")] // elimina un rubro usando su id 
        public async Task<IActionResult> DeleteRubro(int id)
        {
            var rubro = await _context.Rubros.FindAsync(id);

            if (rubro == null)
                return NotFound();

            _context.Rubros.Remove(rubro);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PUT: api/Rubro/5
        [HttpPut("{id}")] // actualiza nombre y porcentaje de un rubro por su id
        public async Task<IActionResult> PutRubro(int id, RubroUpdateDto dto)
        {
            var rubro = await _context.Rubros.FindAsync(id);
            if (rubro == null)
                return NotFound();

            // Calcular suma de porcentajes en el grupo SIN incluir el rubro actual
            int sumaOtros = await _context.Rubros
                .Where(r => r.IdGrupo == rubro.IdGrupo && r.IdRubro != id)
                .SumAsync(r => r.Porcentaje);

            if (sumaOtros + dto.Porcentaje > 100)
            {
                return BadRequest($"No se puede actualizar el rubro porque la suma total de porcentajes para el grupo excedería 100%. Actualmente asignado en otros rubros: {sumaOtros}%.");
            }

            // Actualizar valores
            rubro.NombreRubro = dto.NombreRubro;
            rubro.Porcentaje = dto.Porcentaje;

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}