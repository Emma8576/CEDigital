using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CEDigital.API.Data;
using CEDigital.API.Models;

namespace CEDigital.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NoticiaController : ControllerBase
    {
        private readonly CEDigitalContext _context;

        public NoticiaController(CEDigitalContext context)
        {
            _context = context;
        }

        // POST: api/Noticia
        [HttpPost] //guarda una nueva noticia
        public async Task<ActionResult<Noticia>> PostNoticia(NoticiaCreateDto dto)
        {
            var grupo = await _context.Grupos.FindAsync(dto.IdGrupo);
            if (grupo == null)
                return NotFound($"Grupo con ID {dto.IdGrupo} no existe.");

            var noticia = new Noticia
            {
                Titulo = dto.Titulo,
                Mensaje = dto.Mensaje,
                FechaPublicacion = DateTime.Now,
                IdGrupo = dto.IdGrupo,
                Grupo = grupo
            };

            _context.Noticias.Add(noticia);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetNoticia), new { id = noticia.IdNoticia }, noticia);
        }

        // GET: api/Noticia/5
        [HttpGet("{id}")] //obtiene una noticia por su id
        public async Task<ActionResult<NoticiaDto>> GetNoticia(int id)
        {
            var noticia = await _context.Noticias.FindAsync(id);

            if (noticia == null)
                return NotFound();

            return new NoticiaDto
            {
                IdNoticia = noticia.IdNoticia,
                Titulo = noticia.Titulo,
                Mensaje = noticia.Mensaje,
                FechaPublicacion = noticia.FechaPublicacion,
                IdGrupo = noticia.IdGrupo
            };
        }

        // GET: api/Noticia/grupo/5
        [HttpGet("grupo/{idGrupo}")] //da todas las noticia que tiene un grupo (usa IdGrupo)
        public async Task<ActionResult<List<NoticiaDto>>> GetNoticiasPorGrupo(int idGrupo)
        {
            var noticias = await _context.Noticias
                .Where(n => n.IdGrupo == idGrupo)
                .OrderByDescending(n => n.FechaPublicacion)
                .Select(n => new NoticiaDto
                {
                    IdNoticia = n.IdNoticia,
                    Titulo = n.Titulo,
                    Mensaje = n.Mensaje,
                    FechaPublicacion = n.FechaPublicacion,
                    IdGrupo = n.IdGrupo
                })
                .ToListAsync();

            return noticias;
        }

        // DELETE: api/Noticia/5
        [HttpDelete("{id}")] // elimina una noticia segun un determinado id
        public async Task<IActionResult> DeleteNoticia(int id)
        {
            var noticia = await _context.Noticias.FindAsync(id);

            if (noticia == null)
                return NotFound();

            _context.Noticias.Remove(noticia);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
