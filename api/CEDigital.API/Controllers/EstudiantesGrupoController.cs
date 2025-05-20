using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CEDigital.API.Models;
using CEDigital.API.Data;
using System.Linq;
using System.Collections.Generic;

namespace CEDigital.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EstudianteGrupoController : ControllerBase
    {
        private readonly CEDigitalContext _context;

        public EstudianteGrupoController(CEDigitalContext context)
        {
            _context = context;
        }

       // GET: api/EstudianteGrupo/grupo-con-estudiantes/5
        [HttpGet("grupo-con-estudiantes/{id}")]
        public async Task<ActionResult<GrupoDto>> GetGrupoConEstudiantes(int id)
        {
            var grupo = await _context.Grupos
                .Include(g => g.Estudiantes)
                .FirstOrDefaultAsync(g => g.IdGrupo == id);

            if (grupo == null)
                return NotFound();

            var grupoDto = new GrupoDto
            {
                IdGrupo = grupo.IdGrupo,
                CodigoCurso = grupo.CodigoCurso,
                IdSemestre = grupo.IdSemestre,
                NumeroGrupo = grupo.NumeroGrupo,
                Estudiantes = grupo.Estudiantes.Select(e => new EstudianteGrupoDto
                {
                    IdGrupo = e.IdGrupo,
                    CarnetEstudiante = e.CarnetEstudiante
                }).ToList()
            };

            return grupoDto;
        }

        // GET: api/EstudianteGrupo/grupo-trabajo-miembros/{carnetEstudiante}/{idEvaluacion}
        [HttpGet("grupo-trabajo-miembros/{carnetEstudiante}/{idEvaluacion}")]
        public async Task<ActionResult<IEnumerable<string>>> GetGrupoTrabajoMiembros(
            string carnetEstudiante, int idEvaluacion)
        {
            // Find the IdGrupoTrabajo for the given student and evaluation
            var grupoTrabajo = await _context.GrupoTrabajo
                .FirstOrDefaultAsync(gt => gt.CarnetEstudiante == carnetEstudiante && gt.IdEvaluacion == idEvaluacion);

            if (grupoTrabajo == null)
            {
                return NotFound("Estudiante no encontrado en un grupo de trabajo para esta evaluación.");
            }

            // Find all students in the same GrupoTrabajo
            var miembrosGrupo = await _context.GrupoTrabajo
                .Where(gt => gt.IdGrupoTrabajo == grupoTrabajo.IdGrupoTrabajo)
                .Select(gt => gt.CarnetEstudiante)
                .ToListAsync();

            if (!miembrosGrupo.Any())
            {
                return NotFound("No se encontraron miembros para este grupo de trabajo.");
            }

            return miembrosGrupo;
        }

        // POST: api/EstudianteGrupo
        [HttpPost]
        public async Task<IActionResult> PostEstudiantesGrupo(EstudianteGrupoCreateDto dto)
        {
            var grupo = await _context.Grupos.FindAsync(dto.IdGrupo);
            if (grupo == null)
                return NotFound($"Grupo con ID {dto.IdGrupo} no existe.");

            var asignaciones = dto.CarnetsEstudiantes.Select(carnet => new EstudianteGrupo
            {
                IdGrupo = dto.IdGrupo,
                CarnetEstudiante = carnet,
                Grupo = grupo
            });

            await _context.EstudianteGrupos.AddRangeAsync(asignaciones);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException e)
            {
                return Conflict("Algunos estudiantes ya estaban asignados a este grupo. " + e.Message);
            }

            return Ok("Estudiantes asignados correctamente.");
        }

        // DELETE: api/EstudianteGrupo/5/ABC123
        [HttpDelete("{idGrupo}/{carnetEstudiante}")] //elimina a un estudiante especifico segun el carnet de estudiante
        public async Task<IActionResult> DeleteUno(int idGrupo, string carnetEstudiante)
        {
            var entry = await _context.EstudianteGrupos
                .FirstOrDefaultAsync(eg => eg.IdGrupo == idGrupo && eg.CarnetEstudiante == carnetEstudiante);

            if (entry == null)
                return NotFound("Asignación no encontrada.");

            _context.EstudianteGrupos.Remove(entry);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/EstudianteGrupo/5
        [HttpDelete("{idGrupo}")] // elimina a TOOOS los estudiantes de un grupo
        public async Task<IActionResult> DeleteTodos(int idGrupo)
        {
            var entries = await _context.EstudianteGrupos
                .Where(eg => eg.IdGrupo == idGrupo)
                .ToListAsync();

            if (!entries.Any())
                return NotFound("No hay estudiantes asignados a este grupo.");

            _context.EstudianteGrupos.RemoveRange(entries);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/EstudianteGrupo/estudiante-cursos/ABC123
        [HttpGet("estudiante-cursos/{carnet}")]
        public async Task<ActionResult<List<CursoEstudianteDto>>> GetCursosPorEstudiante(string carnet)
        {
            var grupos = await _context.EstudianteGrupos
                .Where(eg => eg.CarnetEstudiante == carnet)
                .Include(eg => eg.Grupo)
                    .ThenInclude(g => g.Curso)
                .Include(eg => eg.Grupo.Semestre)
                .ToListAsync();

            if (!grupos.Any())
                return NotFound("El estudiante no está matriculado en ningún curso.");

            var cursos = grupos.Select(eg => new CursoEstudianteDto
            {
                IdGrupo = eg.Grupo.IdGrupo,
                CodigoCurso = eg.Grupo.CodigoCurso,
                NombreCurso = eg.Grupo.Curso.NombreCurso, 
                NumeroGrupo = eg.Grupo.NumeroGrupo,
                IdSemestre = eg.Grupo.Semestre.IdSemestre,
                AñoSemestre = eg.Grupo.Semestre.Año,
                PeriodoSemestre = eg.Grupo.Semestre.Periodo,
            }).ToList();

            return cursos;
        }
    }

    public class GrupoDto
    {
        public int IdGrupo { get; set; }
        public string CodigoCurso { get; set; }
        public int IdSemestre { get; set; }
        public int NumeroGrupo { get; set; }
        public List<EstudianteGrupoDto> Estudiantes { get; set; }
    }

    public class EstudianteGrupoDto
    {
        public int IdGrupo { get; set; }
        public string CarnetEstudiante { get; set; }
    }

    public class EstudianteGrupoCreateDto
    {
        public int IdGrupo { get; set; }
        public List<string> CarnetsEstudiantes { get; set; }
    }

    public class CursoEstudianteDto
    {
        public int IdGrupo { get; set; }
        public string CodigoCurso { get; set; }
        public string NombreCurso { get; set; }
        public int NumeroGrupo { get; set; }
        public int IdSemestre { get; set; }
        public int AñoSemestre { get; set; }
        public string PeriodoSemestre { get; set; }
    }
}