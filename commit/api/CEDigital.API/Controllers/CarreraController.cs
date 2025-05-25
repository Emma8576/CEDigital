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

[HttpGet] // Obtiene todas las carreras
public async Task<ActionResult<IEnumerable<Carrera>>> GetCarreras()
{
    var carreras = await _context.Carreras.ToListAsync();

    // ✅ Imprime en la consola del backend cuántas carreras se leyeron
    Console.WriteLine($"Cantidad de carreras encontradas: {carreras.Count}");
    Console.WriteLine("Conectando a base: " + _context.Database.GetDbConnection().Database);
    Console.WriteLine("Cantidad de carreras: " + _context.Carreras.Count());

    return carreras;
}


[HttpGet("{id}")]
public async Task<ActionResult<Carrera>> GetCarrera(int id)
{
    var carrera = await _context.Carreras.FindAsync(id);
    if (carrera == null)
        return NotFound();

    return carrera;
}

[HttpPost]
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

[HttpPut("{id}")]
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

[HttpDelete("{id}")]
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
