using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CEDigital.API.Data;
using CEDigital.API.Models;

namespace CEDigital.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EntregaController : ControllerBase
    {
        private readonly CEDigitalContext _context;

        public EntregaController(CEDigitalContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<ActionResult<Entrega>> PostEntrega(EntregaCreateDto dto)
        {
            var evaluacion = await _context.Evaluaciones
                .Include(e => e.Rubro) 
                .FirstOrDefaultAsync(e => e.IdEvaluacion == dto.IdEvaluacion);

            if (evaluacion == null)
                return NotFound("La evaluación no existe.");

            if (!evaluacion.EsGrupal) //verificacion de que si es una evaluacion grupal el IdGrupoTrabajo exista
            {
                if (string.IsNullOrEmpty(dto.CarnetEstudiante))
                    return BadRequest("Debe proporcionar el carnet del estudiante para una evaluación individual.");

                var idGrupo = evaluacion.Rubro.IdGrupo;

                bool estudianteValido = await _context.EstudianteGrupos
                    .AnyAsync(eg => eg.IdGrupo == idGrupo && eg.CarnetEstudiante == dto.CarnetEstudiante);

                if (!estudianteValido)
                    return BadRequest("El estudiante no pertenece al grupo correspondiente al rubro de esta evaluación.");

                // Ignorar IdGrupoTrabajo
                dto.IdGrupoTrabajo = null;
            }
            else //veridicacion de que si es una evaluacion individual se asigne solo a un carnet que pertene al grupo en el que fue creada la evaluacion
            {
                if (dto.IdGrupoTrabajo == null)
                    return BadRequest("Debe proporcionar el IdGrupoTrabajo para una evaluación grupal.");

                bool grupoValido = await _context.GrupoTrabajos
                    .AnyAsync(gt => gt.IdEvaluacion == dto.IdEvaluacion && gt.IdGrupoTrabajo == dto.IdGrupoTrabajo);

                if (!grupoValido)
                    return BadRequest("El grupo de trabajo no existe para esta evaluación.");

                // Ignorar CarnetEstudiante
                dto.CarnetEstudiante = null;
            }

            var entrega = new Entrega
            {
                IdEvaluacion = dto.IdEvaluacion,
                IdGrupoTrabajo = dto.IdGrupoTrabajo,
                CarnetEstudiante = dto.CarnetEstudiante,
                FechaEntrega = dto.FechaEntrega,
                RutaEntregable = dto.RutaEntregable
            };

            _context.Entregas.Add(entrega);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetEntrega), new { id = entrega.IdEntrega }, entrega);
        }


        // GET: api/Entrega/5
        [HttpGet("{id}")] //busca una entrega especifica con su id
        public async Task<ActionResult<EntregaDto>> GetEntrega(int id)
        {
            var entrega = await _context.Entregas.FindAsync(id);
            if (entrega == null)
                return NotFound();

            return new EntregaDto
            {
                IdEntrega = entrega.IdEntrega,
                IdEvaluacion = entrega.IdEvaluacion,
                IdGrupoTrabajo = entrega.IdGrupoTrabajo,
                CarnetEstudiante = entrega.CarnetEstudiante,
                FechaEntrega = entrega.FechaEntrega,
                RutaEntregable = entrega.RutaEntregable
            };
        }

        // DELETE: api/Entrega/5
        [HttpDelete("{id}")] //borra una entrega especifica 
        public async Task<IActionResult> DeleteEntrega(int id)
        {
            var entrega = await _context.Entregas.FindAsync(id);
            if (entrega == null)
                return NotFound();

            _context.Entregas.Remove(entrega);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/Entrega/evaluacion/5
        [HttpGet("evaluacion/{idEvaluacion}")] //devuelve todas las entregas relacionadas a un (IdEvaluacion)
        public async Task<ActionResult<IEnumerable<EntregaDto>>> GetEntregasPorEvaluacion(int idEvaluacion)
        {
            return await _context.Entregas
                .Where(e => e.IdEvaluacion == idEvaluacion)
                .Select(e => new EntregaDto
                {
                    IdEntrega = e.IdEntrega,
                    IdEvaluacion = e.IdEvaluacion,
                    IdGrupoTrabajo = e.IdGrupoTrabajo,
                    CarnetEstudiante = e.CarnetEstudiante,
                    FechaEntrega = e.FechaEntrega,
                    RutaEntregable = e.RutaEntregable
                })
                .ToListAsync();
        }
    }
}
