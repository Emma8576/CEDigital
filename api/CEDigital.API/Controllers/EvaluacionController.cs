using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CEDigital.API.Data;
using CEDigital.API.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CEDigital.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EvaluacionController : ControllerBase
    {
        private readonly CEDigitalContext _context;

        public EvaluacionController(CEDigitalContext context)
        {
            _context = context;
        }

        // GET: api/Evaluacion/grupo/5
        [HttpGet("grupo/{idGrupo}")]
        public async Task<ActionResult<IEnumerable<object>>> GetEvaluacionesPorGrupo(int idGrupo)
        {
            var evaluaciones = await _context.Evaluaciones
                .Where(e => e.IdRubroNavigation.IdGrupo == idGrupo)
                .Include(e => e.IdRubroNavigation)
                .Select(e => new
                {
                    e.IdEvaluacion,
                    e.NombreEvaluacion,
                    e.FechaHoraLimite,
                    e.ValorPorcentual,
                    e.EsGrupal,
                    e.TieneEntregable,
                    e.CantEstudiantesGrupo,
                    e.RutaEspecificacion,
                    Rubro = new
                    {
                        e.IdRubroNavigation.NombreRubro,
                        e.IdRubroNavigation.Porcentaje
                    },
                    // Include group members' carnets for group evaluations
                    GrupoMiembrosCarnets = e.EsGrupal ? _context.GrupoTrabajos
                        .Where(gt => gt.IdEvaluacion == e.IdEvaluacion)
                        .Select(gt => gt.CarnetEstudiante)
                        .ToList() : null
                })
                .ToListAsync();

            if (!evaluaciones.Any())
            {
                return NotFound("No hay evaluaciones para este grupo.");
            }

            return evaluaciones;
        }

        // TODO: Add other evaluation endpoints (create, update, delete, etc.)
    }
} 