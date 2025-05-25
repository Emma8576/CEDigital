using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CEDigital.API.Models;
using CEDigital.API.Data;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.IO; // Necesario para operaciones de archivo
using Microsoft.AspNetCore.Hosting; // Necesario para IWebHostEnvironment

namespace CEDigital.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CarpetaController : ControllerBase
    {
        private readonly CEDigitalContext _context;
        private readonly IWebHostEnvironment _env; // Para acceder a la ruta de uploads

        public CarpetaController(CEDigitalContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
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
                IdGrupo = dto.IdGrupo,
                Grupo = null!
            };

            var grupo = await _context.Grupos.FindAsync(dto.IdGrupo);

            if (grupo == null)
            {
                return BadRequest("Grupo no encontrado.");
            }

            carpeta.Grupo = grupo;

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

        [HttpGet("{idCarpeta}/archivos")] // Lista los archivos dentro de una carpeta
        public async Task<ActionResult<List<ArchivoDto>>> GetArchivosPorCarpeta(int idCarpeta)
        {
            var archivos = await _context.Archivos
                .Where(a => a.IdCarpeta == idCarpeta)
                .Select(a => new ArchivoDto
                {
                    IdArchivo = a.IdArchivo,
                    NombreArchivo = a.NombreArchivo,
                    FechaPublicacion = a.FechaPublicacion,
                    TamañoArchivo = a.TamañoArchivo,
                    IdCarpeta = a.IdCarpeta,
                    Ruta = a.Ruta // Or just file name if Ruta is internal
                })
                .ToListAsync();

            // Return empty list if no files are found, or the list of files
            return Ok(archivos); // Devolver la lista de archivos, que puede estar vaca
        }

        // GET: api/Carpeta/descargar/5 - Endpoint para descargar un archivo
        [HttpGet("descargar/{idArchivo}")]
        public async Task<IActionResult> DownloadArchivo(int idArchivo)
        {
            var archivo = await _context.Archivos.FindAsync(idArchivo);
            if (archivo == null)
            {
                return NotFound("Archivo no encontrado.");
            }

            var filePath = Path.Combine(_env.WebRootPath, archivo.Ruta.TrimStart('/'));

            if (!System.IO.File.Exists(filePath))
            {
                return NotFound("Archivo no encontrado en el servidor.");
            }

            var memoryStream = new MemoryStream();
            using (var stream = new FileStream(filePath, FileMode.Open))
            {
                await stream.CopyToAsync(memoryStream);
            }
            memoryStream.Position = 0;

            // Try to get the original file name from the path or store it in the DB
            var fileName = Path.GetFileName(filePath); // Or archivo.NombreOriginal if you add it to the model

            return File(memoryStream, "application/octet-stream", fileName); // application/octet-stream for generic download
        }
    }
}
