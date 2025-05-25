using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CEDigital.API.Models;
using CEDigital.API.Data;


namespace CEDigital.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CursoController : ControllerBase
    {
        private readonly CEDigitalContext _context;

        public CursoController(CEDigitalContext context)
        {
            _context = context;
        }

        // GET: api/Curso
        [HttpGet] //obtiene todos los cursos y ademas la carrera a la que pertenecen
        public async Task<ActionResult<IEnumerable<Curso>>> GetCursos()
        {
            return await _context.Cursos
                                .Include(c => c.Carrera)
                                .ToListAsync();
        }

        // GET: api/Curso/CS101
        [HttpGet("{codigo}")] //obtiene un curso especifico y ademas la carrera a la que pertenecen
        public async Task<ActionResult<Curso>> GetCurso(string codigo)
        {
            var curso = await _context.Cursos
                .Include(c => c.Carrera)
                .FirstOrDefaultAsync(c => c.CodigoCurso == codigo);
            if (curso == null)
                return NotFound();

            return curso;
        }

        [HttpPost] //crea un nuevo curso
        public async Task<ActionResult<Curso>> CreateCurso(CursoCreateDto cursoDto)
        {
            var carrera = await _context.Carreras.FindAsync(cursoDto.IdCarrera);
            if (carrera == null)
                return NotFound("Carrera no encontrada");

            var curso = new Curso
            {
                CodigoCurso = cursoDto.CodigoCurso,
                NombreCurso = cursoDto.NombreCurso,
                Creditos = cursoDto.Creditos,
                IdCarrera = cursoDto.IdCarrera,
                Carrera = carrera
            };

            _context.Cursos.Add(curso);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCurso), new { codigo = curso.CodigoCurso }, curso);
        }


        [HttpPut("{codigo}")] //permite actualizar cualquiera de las columnas de curso
        public async Task<IActionResult> UpdateCurso(string codigo, CursoUpdateDto cursoDto)
        {
            var curso = await _context.Cursos.FindAsync(codigo);
            if (curso == null)
                return NotFound();

            curso.NombreCurso = cursoDto.NombreCurso;
            curso.Creditos = cursoDto.Creditos;
            curso.IdCarrera = cursoDto.IdCarrera;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Cursos.Any(c => c.CodigoCurso == codigo))
                    return NotFound();
                else
                    throw;
            }

            return NoContent();
        }


        // DELETE: api/Curso/CS101
        [HttpDelete("{codigo}")]
        public async Task<IActionResult> DeleteCurso(string codigo)
        {
            var curso = await _context.Cursos.FindAsync(codigo);
            if (curso == null)
                return NotFound();

            // Verificar si tiene dependencias (grupos, inscripciones, etc.)
            bool tieneDependencias = await _context.Grupos.AnyAsync(g => g.CodigoCurso == codigo);
            if (tieneDependencias)
            {
                return BadRequest("No se puede eliminar el curso porque tiene grupos asociados.");
            }

            _context.Cursos.Remove(curso);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
