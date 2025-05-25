using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CEDigital.API.Data;
using CEDigital.API.Models;

namespace CEDigital.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ArchivoController : ControllerBase
    {
        private readonly CEDigitalContext _context;

        public ArchivoController(CEDigitalContext context)
        {
            _context = context;
        }

        // POST: api/Archivo
        [HttpPost] //permite guardar un nuevo archivo en uns carpeta
        public async Task<ActionResult<Archivo>> PostArchivo(ArchivoCreateDto dto)
        {
            var archivo = new Archivo
            {
                NombreArchivo = dto.NombreArchivo,
                FechaPublicacion = DateTime.Now,
                TamañoArchivo = dto.TamañoArchivo,
                IdCarpeta = dto.IdCarpeta,
                Ruta = dto.Ruta
            };

            _context.Archivos.Add(archivo);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetArchivo), new { id = archivo.IdArchivo }, archivo);
        }

        // GET: api/Archivo/5
        [HttpGet("{id}")] //  busca un archivo especifico usando su id
        public async Task<ActionResult<ArchivoDto>> GetArchivo(int id)
        {
            var archivo = await _context.Archivos.FindAsync(id);

            if (archivo == null)
                return NotFound();

            return new ArchivoDto
            {
                IdArchivo = archivo.IdArchivo,
                NombreArchivo = archivo.NombreArchivo,
                FechaPublicacion = archivo.FechaPublicacion,
                TamañoArchivo = archivo.TamañoArchivo,
                IdCarpeta = archivo.IdCarpeta,
                Ruta = archivo.Ruta
            };
        }

        // GET: api/Archivo/carpeta/5
        [HttpGet("carpeta/{idCarpeta}")] //devuelve todos los archivos de una carpeta (usa elm IdCarpeta)
        public async Task<ActionResult<List<ArchivoDto>>> GetArchivosPorCarpeta(int idCarpeta)
        {
            var archivos = await _context.Archivos
                .Where(a => a.IdCarpeta == idCarpeta)
                .OrderByDescending(a => a.FechaPublicacion)
                .Select(a => new ArchivoDto
                {
                    IdArchivo = a.IdArchivo,
                    NombreArchivo = a.NombreArchivo,
                    FechaPublicacion = a.FechaPublicacion,
                    TamañoArchivo = a.TamañoArchivo,
                    IdCarpeta = a.IdCarpeta,
                    Ruta = a.Ruta
                })
                .ToListAsync();

            return archivos;
        }

        // DELETE: api/Archivo/5
        [HttpDelete("{id}")] //borra un archivo usando su id
        public async Task<IActionResult> DeleteArchivo(int id)
        {
            var archivo = await _context.Archivos.FindAsync(id);

            if (archivo == null)
                return NotFound();

            _context.Archivos.Remove(archivo);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
