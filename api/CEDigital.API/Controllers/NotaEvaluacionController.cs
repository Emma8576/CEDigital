using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CEDigital.API.Data;
using CEDigital.API.Models;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace CEDigital.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotaEvaluacionController : ControllerBase
    {
        private readonly CEDigitalContext _context;

        public NotaEvaluacionController(CEDigitalContext context)
        {
            _context = context;
        }

        // GET: api/NotaEvaluacion/estudiante/2023298134/grupo/5
        [HttpGet("estudiante/{carnetEstudiante}/grupo/{idGrupo}")]
        public async Task<ActionResult<IEnumerable<NotaEvaluacion>>> GetNotasEstudiantePorGrupo(string carnetEstudiante, int idGrupo)
        {
            // Obtener las evaluaciones para el grupo especfico
            var evaluacionesGrupo = await _context.Evaluaciones
                .Where(e => e.IdRubroNavigation.IdGrupo == idGrupo) // Asumiendo navegacin de Evaluacion -> Rubro -> Grupo
                .ToListAsync();

            if (!evaluacionesGrupo.Any())
            {
                 // Podra ser que no haya evaluaciones an, o el grupo no existe
                 return Ok(new List<NotaEvaluacion>()); // Devolver lista vaca si no hay evaluaciones en el grupo
            }

            var evaluacionIds = evaluacionesGrupo.Select(e => e.IdEvaluacion).ToList();

            // Obtener las notas de las evaluaciones del grupo para el estudiante o su grupo de trabajo
            var notas = await _context.NotaEvaluaciones
                .Include(ne => ne.IdEvaluacionNavigation)
                .Where(ne => evaluacionIds.Contains(ne.IdEvaluacion) && 
                             (ne.IdGrupoTrabajoNavigation.EstudianteGrupoTrabajo.Any(gt => gt.CarnetEstudiante == carnetEstudiante) || // Si es grupal
                              (ne.IdEvaluacionNavigation.EsGrupal == false && _context.Entregas.Any(e => e.IdEvaluacion == ne.IdEvaluacion && e.CarnetEstudiante == carnetEstudiante)))) // Si es individual y tiene una entrega
                .ToListAsync();

             // Opcional: Filtrar ms si un estudiante individual no tiene entrega pero existe la evaluacin individual (si quieres mostrar 0)
             // Esto puede volverse complejo dependiendo de la lgica exacta de tu negocio para notas individuales sin entrega

            return notas;
        }

        // TODO: Add other NotaEvaluacion endpoints if needed
    }
} 