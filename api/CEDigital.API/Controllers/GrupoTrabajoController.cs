using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CEDigital.API.Data;
using CEDigital.API.Models;

namespace CEDigital.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GrupoTrabajoController : ControllerBase
    {
        private readonly CEDigitalContext _context;

        public GrupoTrabajoController(CEDigitalContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> PostGrupoTrabajo(GrupoTrabajoCreateDto dto)
        {
            var evaluacion = await _context.Evaluaciones
                .Include(e => e.Rubro)
                .FirstOrDefaultAsync(e => e.IdEvaluacion == dto.IdEvaluacion);

            if (evaluacion == null)
                return NotFound("Evaluación no encontrada.");

            var idGrupo = evaluacion.Rubro.IdGrupo;

            var estudiantePertenece = await _context.EstudianteGrupos
                .AnyAsync(eg =>
                    eg.CarnetEstudiante == dto.CarnetEstudiante &&
                    eg.IdGrupo == idGrupo);

            if (!estudiantePertenece)
                return BadRequest("El estudiante no pertenece al grupo asociado a esta evaluación.");

            // Verificar que el grupo de trabajo no esté lleno
            var cantidadActual = await _context.GrupoTrabajos
                .CountAsync(gt =>
                    gt.IdGrupoTrabajo == dto.IdGrupoTrabajo &&
                    gt.IdEvaluacion == dto.IdEvaluacion);

            if (cantidadActual >= evaluacion.CantEstudiantesGrupo)
                return BadRequest("El grupo de trabajo ya tiene el número máximo de estudiantes permitido.");

            var grupoTrabajo = new GrupoTrabajo
            {
                CarnetEstudiante = dto.CarnetEstudiante,
                IdGrupoTrabajo = dto.IdGrupoTrabajo,
                IdEvaluacion = dto.IdEvaluacion
            };

            _context.GrupoTrabajos.Add(grupoTrabajo);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetGrupoTrabajoPorClave), new
            {
                carnet = grupoTrabajo.CarnetEstudiante,
                idGrupo = grupoTrabajo.IdGrupoTrabajo,
                idEvaluacion = grupoTrabajo.IdEvaluacion
            }, grupoTrabajo);
        }


        [HttpGet("porclave/{carnet}/{idGrupo}/{idEvaluacion}")] //no, solo es usado por el post
        public async Task<ActionResult<GrupoTrabajoDto>> GetGrupoTrabajoPorClave(string carnet, int idGrupo, int idEvaluacion)
        {
            var gt = await _context.GrupoTrabajos.FindAsync(carnet, idGrupo, idEvaluacion);

            if (gt == null)
                return NotFound();

            return new GrupoTrabajoDto
            {
                IdGrupoTrabajo = gt.IdGrupoTrabajo,
                CarnetEstudiante = gt.CarnetEstudiante,
                IdEvaluacion = gt.IdEvaluacion
            };
        }


        // GET: api/GrupoTrabajo/grupos/evaluacion/5
        [HttpGet("grupos/evaluacion/{idEvaluacion}")] //Devuelve el id de todos los grupo asociados a una evalucion (usa IdEvaluacion)
        public async Task<ActionResult<IEnumerable<int>>> GetGruposPorEvaluacion(int idEvaluacion)
        {
            var grupos = await _context.GrupoTrabajos
                .Where(gt => gt.IdEvaluacion == idEvaluacion)
                .Select(gt => gt.IdGrupoTrabajo)
                .Distinct()
                .ToListAsync();

            return grupos;
        }

        // GET: api/GrupoTrabajo/grupos/estudiante/202503001
        [HttpGet("grupos/estudiante/{carnet}")] // devuelve todos los grupos a los que esta asociado un estudiante (usa el carnet)
        public async Task<ActionResult<IEnumerable<GrupoTrabajoDto>>> GetGruposPorEstudiante(string carnet)
        {
            var grupos = await _context.GrupoTrabajos
                .Where(gt => gt.CarnetEstudiante == carnet)
                .Select(gt => new GrupoTrabajoDto
                {
                    CarnetEstudiante = gt.CarnetEstudiante,
                    IdGrupoTrabajo = gt.IdGrupoTrabajo,
                    IdEvaluacion = gt.IdEvaluacion
                })
                .ToListAsync();

            return grupos;
        }

        // DELETE: api/GrupoTrabajo/{carnet}/{idGrupo}/{idEvaluacion}
        [HttpDelete("{carnet}/{idGrupo}/{idEvaluacion}")] //elimina un integrante del grupo hay que especificar
        public async Task<IActionResult> DeleteGrupoTrabajo(string carnet, int idGrupo, int idEvaluacion)
        {
            var grupo = await _context.GrupoTrabajos.FindAsync(carnet, idGrupo, idEvaluacion);

            if (grupo == null)
                return NotFound("No se encontró el grupo de trabajo con los valores especificados.");

            _context.GrupoTrabajos.Remove(grupo);
            await _context.SaveChangesAsync();

            return NoContent();
        }


    }
}
