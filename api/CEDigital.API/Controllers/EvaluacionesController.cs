using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CEDigital.API.Data;
using CEDigital.API.Models;

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

        // POST: api/Evaluacion
        [HttpPost]
        public async Task<ActionResult<Evaluacion>> PostEvaluacion(EvaluacionCreateDto dto)
        {
            // Obtener el rubro correspondiente
            var rubro = await _context.Rubros.FindAsync(dto.IdRubro);

            if (rubro == null)
                return NotFound("El rubro especificado no existe.");

            // Calcular suma actual de valores porcentuales de evaluaciones en este rubro
            int sumaActual = await _context.Evaluaciones
                .Where(e => e.IdRubro == dto.IdRubro)
                .SumAsync(e => e.ValorPorcentual);

            // Validar que el nuevo valor no exceda el porcentaje permitido
            if (sumaActual + dto.ValorPorcentual > rubro.Porcentaje)
            {
                return BadRequest($"No se puede agregar esta evaluación porque la suma total de porcentajes ({sumaActual + dto.ValorPorcentual}%) excede el porcentaje asignado al rubro ({rubro.Porcentaje}%).");
            }

            var evaluacion = new Evaluacion
            {
                IdRubro = dto.IdRubro,
                NombreEvaluacion = dto.NombreEvaluacion,
                FechaHoraLimite = dto.FechaHoraLimite,
                ValorPorcentual = dto.ValorPorcentual,
                EsGrupal = dto.EsGrupal,
                TieneEntregable = dto.TieneEntregable,
                CantEstudiantesGrupo = dto.CantEstudiantesGrupo,
                RutaEspecificacion = dto.RutaEspecificacion
            };

            _context.Evaluaciones.Add(evaluacion);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetEvaluacion), new { id = evaluacion.IdEvaluacion }, evaluacion);
        }


        // GET: api/Evaluacion/5
        [HttpGet("{id}")] // Permite buscar una evaluacion según su id
        public async Task<ActionResult<EvaluacionDto>> GetEvaluacion(int id)
        {
            var evaluacion = await _context.Evaluaciones.FindAsync(id);

            if (evaluacion == null)
                return NotFound();

            return new EvaluacionDto
            {
                IdEvaluacion = evaluacion.IdEvaluacion,
                IdRubro = evaluacion.IdRubro,
                NombreEvaluacion = evaluacion.NombreEvaluacion,
                FechaHoraLimite = evaluacion.FechaHoraLimite,
                ValorPorcentual = evaluacion.ValorPorcentual,
                EsGrupal = evaluacion.EsGrupal,
                TieneEntregable = evaluacion.TieneEntregable,
                CantEstudiantesGrupo = evaluacion.CantEstudiantesGrupo,
                RutaEspecificacion = evaluacion.RutaEspecificacion
            };
        }

        // GET: api/Evaluacion/rubro/5
        [HttpGet("rubro/{idRubro}")] // busca todas las evaluaciones relacionadas a un rubro (usa IdRubro)
        public async Task<ActionResult<IEnumerable<EvaluacionDto>>> GetEvaluacionesPorRubro(int idRubro)
        {
            return await _context.Evaluaciones
                .Where(e => e.IdRubro == idRubro)
                .Select(e => new EvaluacionDto
                {
                    IdEvaluacion = e.IdEvaluacion,
                    IdRubro = e.IdRubro,
                    NombreEvaluacion = e.NombreEvaluacion,
                    FechaHoraLimite = e.FechaHoraLimite,
                    ValorPorcentual = e.ValorPorcentual,
                    EsGrupal = e.EsGrupal,
                    TieneEntregable = e.TieneEntregable,
                    CantEstudiantesGrupo = e.CantEstudiantesGrupo,
                    RutaEspecificacion = e.RutaEspecificacion
                })
                .ToListAsync();
        }

        // DELETE: api/Evaluacion/5
        [HttpDelete("{id}")] //elimina una evalucaion segun su id especifico 
        public async Task<IActionResult> DeleteEvaluacion(int id)
        {
            var evaluacion = await _context.Evaluaciones.FindAsync(id);
            if (evaluacion == null)
                return NotFound();

            _context.Evaluaciones.Remove(evaluacion);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PUT: api/Evaluacion/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEvaluacion(int id, EvaluacionUpdateDto dto)
        {
            var evaluacion = await _context.Evaluaciones.FindAsync(id);
            if (evaluacion == null)
                return NotFound("La evaluación no existe.");

            // Obtener el rubro relacionado
            var rubro = await _context.Rubros.FindAsync(evaluacion.IdRubro);
            if (rubro == null)
                return NotFound("El rubro asociado no existe.");

            // Calcular la suma de los porcentajes de otras evaluaciones del mismo rubro
            int sumaOtros = await _context.Evaluaciones
                .Where(e => e.IdRubro == evaluacion.IdRubro && e.IdEvaluacion != id)
                .SumAsync(e => e.ValorPorcentual);

            if (sumaOtros + dto.ValorPorcentual > rubro.Porcentaje)
            {
                return BadRequest($"No se puede actualizar esta evaluación porque la suma total de porcentajes ({sumaOtros + dto.ValorPorcentual}%) excede el porcentaje asignado al rubro ({rubro.Porcentaje}%).");
            }

            // Actualizar campos permitidos
            evaluacion.NombreEvaluacion = dto.NombreEvaluacion;
            evaluacion.FechaHoraLimite = dto.FechaHoraLimite;
            evaluacion.ValorPorcentual = dto.ValorPorcentual;
            evaluacion.EsGrupal = dto.EsGrupal;
            evaluacion.TieneEntregable = dto.TieneEntregable;
            evaluacion.CantEstudiantesGrupo = dto.CantEstudiantesGrupo;
            evaluacion.RutaEspecificacion = dto.RutaEspecificacion;

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
