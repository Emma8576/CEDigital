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
        public async Task<ActionResult<IEnumerable<Evaluacion>>> GetEvaluacionesPorGrupo(int idGrupo)
        {
            var evaluaciones = await _context.Evaluaciones
                .Where(e => e.IdRubroNavigation.IdGrupo == idGrupo) // Asumiendo que Rubro tiene navegacin a Grupo
                .Include(e => e.IdRubroNavigation) // Incluir el Rubro para filtrar por grupo
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