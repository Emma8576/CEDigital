using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CEDigital.API.Data;
using CEDigital.API.Models;

namespace CEDigital.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CarreraController : ControllerBase
    {
        private readonly CEDigitalContext _context;

        public CarreraController(CEDigitalContext context)
        {
            _context = context;
        }

        // GET: api/Carrera
        [HttpGet] //Obtiene todas las carreras
        public async Task<ActionResult<IEnumerable<Carrera>>> GetCarreras()
        {
            return await _context.Carreras.ToListAsync();
        }

        // GET: api/Carrera/1
        [HttpGet("{id}")] //obtiene la carrera que tiene un determinado id
        public async Task<ActionResult<Carrera>> GetCarrera(int id)
        {
            var carrera = await _context.Carreras.FindAsync(id);
            if (carrera == null)
                return NotFound();

            return carrera;
        }

        [HttpPost] //guarda una nueva tupla (nueva carrera)
        public async Task<ActionResult<Carrera>> CreateCarrera(CarreraCreateDto dto)
        {
            var carrera = new Carrera
            {
                NombreCarrera = dto.NombreCarrera
            };

            _context.Carreras.Add(carrera);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCarrera), new { id = carrera.IdCarrera }, carrera);
        }

        // PUT: api/Carrera/1
        [HttpPut("{id}")] // Actualiza solo el nombre de la carrera
        public async Task<IActionResult> UpdateCarrera(int id, CarreraUpdateDto dto)
        {
            var carrera = await _context.Carreras.FindAsync(id);
            if (carrera == null)
                return NotFound();

            carrera.NombreCarrera = dto.NombreCarrera;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Carreras.Any(e => e.IdCarrera == id))
                    return NotFound();
                else
                    throw;
            }

            return NoContent();
        }

        // DELETE: api/Carrera/1
        [HttpDelete("{id}")] // elimina una carrera por id
        public async Task<IActionResult> DeleteCarrera(int id)
        {
            var carrera = await _context.Carreras.FindAsync(id);
            if (carrera == null)
                return NotFound();

            _context.Carreras.Remove(carrera);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
