using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CEDigital.API.Data;
using CEDigital.API.Models;
using System.Collections.Generic;
using System.IO.Ports;

namespace CEDigital.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotaEvaluacionController : ControllerBase
    {
        private readonly CEDigitalContext _context;

        public NotaEvaluacionController(CEDigitalContext context)
        {
            _context = context;
        }

        [HttpGet] //obtiene TODAS las notas de TODAS las evaluaciones
        public async Task<ActionResult<IEnumerable<NotaEvaluacionDto>>> GetAll()
        {
            var notas = await _context.NotaEvaluaciones
                .Select(n => new NotaEvaluacionDto
                {
                    IdNotaEvaluacion = n.IdNotaEvaluacion,
                    PorcentajeObtenido = n.PorcentajeObtenido,
                    Observaciones = n.Observaciones,
                    RutaArchivoDetalles = n.RutaArchivoDetalles,
                    Publicada = n.Publicada,
                    IdEvaluacion = n.IdEvaluacion,
                    CarnetEstudiante = n.CarnetEstudiante,
                    IdGrupoTrabajo = n.IdGrupoTrabajo
                })
                .ToListAsync();

            return Ok(notas);
        }

        [HttpGet("{id}")] //obtiene una nota especifica (usa IdNotaEvaluacion)
        public async Task<ActionResult<NotaEvaluacionDto>> GetById(int id)
        {
            var nota = await _context.NotaEvaluaciones.FindAsync(id);

            if (nota == null)
                return NotFound();

            return Ok(new NotaEvaluacionDto
            {
                IdNotaEvaluacion = nota.IdNotaEvaluacion,
                PorcentajeObtenido = nota.PorcentajeObtenido,
                Observaciones = nota.Observaciones,
                RutaArchivoDetalles = nota.RutaArchivoDetalles,
                Publicada = nota.Publicada,
                IdEvaluacion = nota.IdEvaluacion,
                CarnetEstudiante = nota.CarnetEstudiante,
                IdGrupoTrabajo = nota.IdGrupoTrabajo
            });
        }

        [HttpPost] //Permite guardar una nueva nota  
        public async Task<ActionResult> Create([FromBody] NotaEvaluacionCreateDto dto)
        {
            // Obtener la evaluación y su rubro
            var evaluacion = await _context.Evaluaciones
                .Include(e => e.Rubro)
                .FirstOrDefaultAsync(e => e.IdEvaluacion == dto.IdEvaluacion);

            if (evaluacion == null)
                return BadRequest("Evaluación no encontrada.");

            // Validar que el porcentaje no exceda el máximo permitido
            if (dto.PorcentajeObtenido > evaluacion.ValorPorcentual)
                return BadRequest($"El porcentaje obtenido ({dto.PorcentajeObtenido}) excede el valor porcentual máximo de la evaluación ({evaluacion.ValorPorcentual}).");


            if (evaluacion.EsGrupal)
            {
                // Validar que el grupo de trabajo pertenezca a esa evaluación
                var grupoTrabajoValido = await _context.GrupoTrabajos
                    .AnyAsync(gt => gt.IdGrupoTrabajo == dto.IdGrupoTrabajo && gt.IdEvaluacion == dto.IdEvaluacion);

                if (!grupoTrabajoValido)
                    return BadRequest("El grupo de trabajo no pertenece a esta evaluación.");

                // Verificar duplicado
                var notaExistente = await _context.NotaEvaluaciones
                    .AnyAsync(n => n.IdEvaluacion == dto.IdEvaluacion && n.IdGrupoTrabajo == dto.IdGrupoTrabajo);

                if (notaExistente)
                    return Conflict("Ya existe una nota registrada para este grupo de trabajo en esta evaluación.");

                // Crear nota grupal
                var nota = new NotaEvaluacion
                {
                    PorcentajeObtenido = dto.PorcentajeObtenido,
                    Observaciones = dto.Observaciones,
                    RutaArchivoDetalles = dto.RutaArchivoDetalles,
                    Publicada = dto.Publicada,
                    IdEvaluacion = dto.IdEvaluacion,
                    IdGrupoTrabajo = dto.IdGrupoTrabajo,
                    CarnetEstudiante = null
                };

                _context.NotaEvaluaciones.Add(nota);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetById), new { id = nota.IdNotaEvaluacion }, nota);
            }
            else
            {
                // Obtener el grupo de la evaluación
                var idGrupo = evaluacion.Rubro.IdGrupo;

                // Verificar que el estudiante pertenezca al grupo
                var estudianteValido = await _context.EstudianteGrupos
                    .AnyAsync(eg => eg.CarnetEstudiante == dto.CarnetEstudiante && eg.IdGrupo == idGrupo);

                if (!estudianteValido)
                    return BadRequest("El estudiante no pertenece al grupo asociado a esta evaluación.");

                // Verificar duplicado
                var notaExistente = await _context.NotaEvaluaciones
                    .AnyAsync(n => n.IdEvaluacion == dto.IdEvaluacion && n.CarnetEstudiante == dto.CarnetEstudiante);

                if (notaExistente)
                    return Conflict("Ya existe una nota registrada para este estudiante en esta evaluación.");

                // Crear nota individual
                var nota = new NotaEvaluacion
                {
                    PorcentajeObtenido = dto.PorcentajeObtenido,
                    Observaciones = dto.Observaciones,
                    RutaArchivoDetalles = dto.RutaArchivoDetalles,
                    Publicada = dto.Publicada,
                    IdEvaluacion = dto.IdEvaluacion,
                    CarnetEstudiante = dto.CarnetEstudiante,
                    IdGrupoTrabajo = null
                };

                _context.NotaEvaluaciones.Add(nota);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetById), new { id = nota.IdNotaEvaluacion }, nota);
            }
        }



        [HttpPut("{id}")] //Permite modificar algunas de una nota especifica (usa IdNotaEvaluacion)
        public async Task<ActionResult> Update(int id, [FromBody] NotaEvaluacionUpdateDto dto)
        {
            var nota = await _context.NotaEvaluaciones.FindAsync(id);
            if (nota == null)
                return NotFound();

            nota.PorcentajeObtenido = dto.PorcentajeObtenido;
            nota.Observaciones = dto.Observaciones;
            nota.RutaArchivoDetalles = dto.RutaArchivoDetalles;
            nota.Publicada = dto.Publicada;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")] //elimina una nota especifica (usa IdNotaEvaluacion)
        public async Task<ActionResult> Delete(int id)
        {
            var nota = await _context.NotaEvaluaciones.FindAsync(id);
            if (nota == null)
                return NotFound();

            _context.NotaEvaluaciones.Remove(nota);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/NotaEvaluacion/evaluacion/5
        [HttpGet("evaluacion/{idEvaluacion}")] // obtiene todas las notas asociadas a un IdEvaluacion
        public async Task<ActionResult<IEnumerable<NotaEvaluacionDto>>> GetByEvaluacion(int idEvaluacion)
        {
            var notas = await _context.NotaEvaluaciones
                .Where(n => n.IdEvaluacion == idEvaluacion)
                .Select(n => new NotaEvaluacionDto
                {
                    IdNotaEvaluacion = n.IdNotaEvaluacion,
                    PorcentajeObtenido = n.PorcentajeObtenido,
                    Observaciones = n.Observaciones,
                    RutaArchivoDetalles = n.RutaArchivoDetalles,
                    Publicada = n.Publicada,
                    IdEvaluacion = n.IdEvaluacion,
                    CarnetEstudiante = n.CarnetEstudiante,
                    IdGrupoTrabajo = n.IdGrupoTrabajo
                })
                .ToListAsync();

            return Ok(notas);
        }

        // GET: api/NotaEvaluacion/estudiante/{carnetEstudiante}/grupo/{idGrupo}
        [HttpGet("estudiante/{carnetEstudiante}/grupo/{idGrupo}")] // Obtiene las notas de un estudiante para las evaluaciones dentro de un grupo específico
        public async Task<ActionResult<IEnumerable<NotaEvaluacionDto>>> GetNotasPorEstudianteYGrupo(string carnetEstudiante, int idGrupo)
        {
            // Primero, encontrar los Rubros asociados a este grupo
            var rubrosIds = await _context.Rubros
                .Where(r => r.IdGrupo == idGrupo)
                .Select(r => r.IdRubro)
                .ToListAsync();

            if (!rubrosIds.Any())
            {
                return Ok(new List<NotaEvaluacionDto>()); // No hay rubros para este grupo, por lo tanto no hay evaluaciones/notas
            }

            // Luego, encontrar las Evaluaciones asociadas a esos Rubros
            var evaluacionesIds = await _context.Evaluaciones
                .Where(e => rubrosIds.Contains(e.IdRubro))
                .Select(e => e.IdEvaluacion)
                .ToListAsync();

            if (!evaluacionesIds.Any())
            {
                return Ok(new List<NotaEvaluacionDto>()); // No hay evaluaciones para estos rubros, por lo tanto no hay notas
            }

            // Finalmente, buscar las Notas para estas Evaluaciones y el estudiante (o su grupo de trabajo si es grupal)
            var notas = await _context.NotaEvaluaciones
                .Where(n => evaluacionesIds.Contains(n.IdEvaluacion) &&
                           (n.CarnetEstudiante == carnetEstudiante || // Para evaluaciones individuales
                            (_context.GrupoTrabajos.Any(gt => gt.IdEvaluacion == n.IdEvaluacion && gt.CarnetEstudiante == carnetEstudiante && gt.IdGrupoTrabajo == n.IdGrupoTrabajo)))) // Para evaluaciones grupales
                .Select(n => new NotaEvaluacionDto
                {
                    IdNotaEvaluacion = n.IdNotaEvaluacion,
                    PorcentajeObtenido = n.PorcentajeObtenido,
                    Observaciones = n.Observaciones,
                    RutaArchivoDetalles = n.RutaArchivoDetalles,
                    Publicada = n.Publicada,
                    IdEvaluacion = n.IdEvaluacion,
                    CarnetEstudiante = n.CarnetEstudiante,
                    IdGrupoTrabajo = n.IdGrupoTrabajo
                })
                .ToListAsync();

            return Ok(notas); // Retorna la lista de notas encontradas (puede estar vacía)
        }
    }
}

