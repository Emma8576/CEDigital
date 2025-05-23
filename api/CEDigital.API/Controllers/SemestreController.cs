using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CEDigital.API.Data;
using CEDigital.API.Models;

namespace CEDigital.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SemestreController : ControllerBase
    {
        private readonly CEDigitalContext _context;

        public SemestreController(CEDigitalContext context)
        {
            _context = context;
        }

        // GET: api/Semestre
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Semestre>>> GetSemestres()
        {
            return await _context.Semestres.ToListAsync();
        }

        // GET: api/Semestre/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Semestre>> GetSemestre(int id)
        {
            var semestre = await _context.Semestres.FindAsync(id);

            if (semestre == null)
                return NotFound();

            return semestre;
        }

        // GET: api/Semestre/5/cantidad-grupos
        [HttpGet("{id}/cantidad-grupos")]
        public async Task<ActionResult<SemestreCantidadGruposDto>> GetSemestreCantidadCursos(int id)
        {
            var semestreConGrupos = await _context.Semestres
                .Where(s => s.IdSemestre == id)
                .Select(s => new SemestreCantidadGruposDto
                {
                    IdSemestre = s.IdSemestre,
                    Periodo = s.Periodo,
                    Año = s.Año,
                    CantidadGrupos = s.Grupos.Count()
                })
                .FirstOrDefaultAsync();

            if (semestreConGrupos == null)
                return NotFound();

            return semestreConGrupos;
        }

        // POST: api/Semestre
        [HttpPost]
        public async Task<ActionResult<Semestre>> CreateSemestre(SemestreCreateDto dto)
        {
            var semestre = new Semestre
            {
                Periodo = dto.Periodo,
                Año = dto.Año,
            };

            _context.Semestres.Add(semestre);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSemestre), new { id = semestre.IdSemestre }, semestre);
        }

        // PUT: api/Semestre/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSemestre(int id, SemestreUpdateDto dto)
        {
            var semestre = await _context.Semestres.FindAsync(id);
            if (semestre == null)
                return NotFound();

            semestre.Periodo = dto.Periodo;
            semestre.Año = dto.Año;

            _context.Entry(semestre).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Semestres.Any(e => e.IdSemestre == id))
                    return NotFound();
                else
                    throw;
            }

            return NoContent();
        }

        // DELETE: api/Semestre/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSemestre(int id)
        {
            var semestre = await _context.Semestres.FindAsync(id);
            if (semestre == null)
                return NotFound();

            bool tieneGrupos = await _context.Grupos.AnyAsync(g => g.IdSemestre == id);
            if (tieneGrupos)
            {
                return BadRequest("No se puede eliminar el semestre porque tiene cursos asociados.");
            }

            try
            {
                _context.Semestres.Remove(semestre);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, "Error de base de datos al intentar eliminar el semestre.");
            }
        }
    }

    public class SemestreCreateDto
    {
        public string Periodo { get; set; }
        public int Año { get; set; }
    }

    public class SemestreUpdateDto
    {
        public string Periodo { get; set; }
        public int Año { get; set; }
    }
}