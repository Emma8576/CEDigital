using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CEDigital.API.Models;
using CEDigital.API.Data;

namespace CEDigital.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GrupoController : ControllerBase
    {
        private readonly CEDigitalContext _context;

        public GrupoController(CEDigitalContext context)
        {
            _context = context;
        }

        // GET: api/Grupo
        [HttpGet] //Este get devuelve todos los grupos, con toda su informacion (informacion del grupo y de la carrera a la que pertenece el curso)
        public async Task<ActionResult<IEnumerable<Grupo>>> GetGrupos()
        {
            return await _context.Grupos
                .Include(g => g.Curso)
                    .ThenInclude(c => c.Carrera)
                .Include(g => g.Semestre)
                .ToListAsync();
        }

        // GET: api/Grupo/5
        [HttpGet("{id}")] //Este get devuelve un solo grupo segun el id con toda su informacion (informacion del grupo y de la carrera a la que pertenece el curso)
        public async Task<ActionResult<Grupo>> GetGrupo(int id)
        {
            var grupo = await _context.Grupos
                .Include(g => g.Curso)
                .Include(g => g.Semestre)
                .FirstOrDefaultAsync(g => g.IdGrupo == id);

            if (grupo == null)
                return NotFound();

            return grupo;
        }

        // GET: api/Grupo/basic/5
        [HttpGet("basic/{id}")]
        public async Task<ActionResult<GrupoBasicDto>> GetGrupoBasic(int id)
        {
            var grupo = await _context.Grupos.FindAsync(id);

            if (grupo == null)
                return NotFound();

            var dto = new GrupoBasicDto
            {
                IdGrupo = grupo.IdGrupo,
                CodigoCurso = grupo.CodigoCurso,
                IdSemestre = grupo.IdSemestre,
                NumeroGrupo = grupo.NumeroGrupo
            };

            return dto;
        }

        // POST: api/Grupo
        [HttpPost] //crea un nuevo grupo, tambien crea las carpetas de  Presentaciones, Quices, Proyectos y Examenes por defecto
        public async Task<ActionResult<Grupo>> PostGrupo(GrupoCreateDto grupoDto)
        {
            var grupo = new Grupo
            {
                CodigoCurso = grupoDto.CodigoCurso,
                IdSemestre = grupoDto.IdSemestre,
                NumeroGrupo = grupoDto.NumeroGrupo
            };

            _context.Grupos.Add(grupo);

            try
            {
                await _context.SaveChangesAsync(); // Guarda para obtener el IdGrupo generado

                // Crear carpetas por defecto
                var nombresCarpetas = new[] { "Presentaciones", "Quices", "Proyectos", "Exámenes" };
                foreach (var nombre in nombresCarpetas)
                {
                    var carpeta = new Carpeta
                    {
                        NombreCarpeta = nombre,
                        IdGrupo = grupo.IdGrupo
                    };
                    _context.Carpetas.Add(carpeta);
                }

                await _context.SaveChangesAsync(); // Guarda las carpetas
            }
            catch (DbUpdateException ex)
            {
                return Conflict(ex.InnerException?.Message);
            }

            return CreatedAtAction(nameof(GetGrupo), new { id = grupo.IdGrupo }, grupo);
        }

        // PUT: api/Grupo/5
        [HttpPut("{id}")] // actualiza cualquier valor de las columnas de Grupo por un id especifico 
        public async Task<IActionResult> PutGrupo(int id, GrupoUpdateDto grupoDto)
        {
            var grupo = await _context.Grupos.FindAsync(id);

            if (grupo == null)
                return NotFound();

            grupo.CodigoCurso = grupoDto.CodigoCurso;
            grupo.IdSemestre = grupoDto.IdSemestre;
            grupo.NumeroGrupo = grupoDto.NumeroGrupo;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                return Conflict("Error al actualizar el grupo. Verifica que los datos sean válidos.");
            }

            return NoContent(); // 204 OK sin contenido
        }


        // DELETE: api/Grupo/5
        [HttpDelete("{id}")] // elimina un grupo mediante el id
        public async Task<IActionResult> DeleteGrupo(int id)
        {
            var grupo = await _context.Grupos.FindAsync(id);
            if (grupo == null)
                return NotFound();

            _context.Grupos.Remove(grupo);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        // GET: api/Grupo/conCursos
        [HttpGet("conCursos")]
        public async Task<ActionResult<IEnumerable<object>>> GetGruposConCursos()
        {
            var grupos = await _context.Grupos
                .Include(g => g.Curso)
                .Select(g => new {
                    g.IdGrupo,
                    g.NumeroGrupo,
                    NombreCurso = g.Curso.NombreCurso
                })
                .ToListAsync();

            return Ok(grupos);
        }

    }
}
