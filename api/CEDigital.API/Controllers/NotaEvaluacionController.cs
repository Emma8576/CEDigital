using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CEDigital.API.Data;
using CEDigital.API.Models;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using CEDigital.API.Services;

namespace CEDigital.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotaEvaluacionController : ControllerBase
    {
        private readonly CEDigitalContext _context;
        private readonly MongoDBService _mongoDBService;

        public NotaEvaluacionController(CEDigitalContext context, MongoDBService mongoDBService)
        {
            _context = context;
            _mongoDBService = mongoDBService;
        }

        [HttpGet]
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

            return notas;
        }

        [HttpGet("estudiante/{carnetEstudiante}/grupo/{idGrupo}/consolidado")]
        public async Task<ActionResult<StudentEvaluationsGradesDto>> GetStudentEvaluationsAndGrades(string carnetEstudiante, int idGrupo)
        {
            Console.WriteLine($"Received request for GetStudentEvaluationsAndGrades - Carnet: {carnetEstudiante}, Grupo: {idGrupo}");
            var estudiante = await _mongoDBService.GetStudentByCarnetAsync(carnetEstudiante);
            if (estudiante == null)
            {
                return NotFound("Estudiante no encontrado.");
            }

            var rubrosWithEvaluations = await _context.Rubros
                .Where(r => r.IdGrupo == idGrupo)
                .Include(r => r.Evaluaciones)
                    .ThenInclude(e => e.NotaEvaluaciones)
                .OrderBy(r => r.NombreRubro)
                .ToListAsync();

            if (!rubrosWithEvaluations.Any())
            {
                return Ok(new StudentEvaluationsGradesDto
                {
                    NombreEstudiante = estudiante.Nombre,
                    NotaTotal = 0,
                    Rubros = new List<RubricWithEvaluationsDto>()
                });
            }

            var studentEvaluationsGradesDto = new StudentEvaluationsGradesDto
            {
                NombreEstudiante = estudiante.Nombre,
                Rubros = rubrosWithEvaluations.Select(r => new RubricWithEvaluationsDto
                {
                    IdRubro = r.IdRubro,
                    NombreRubro = r.NombreRubro,
                    PorcentajeRubro = (int)r.Porcentaje,
                    Evaluaciones = r.Evaluaciones.Select(e => new EvaluationWithGradeDto
                    {
                        IdEvaluacion = e.IdEvaluacion,
                        NombreEvaluacion = e.NombreEvaluacion,
                        FechaHoraLimite = e.FechaHoraLimite,
                        ValorPorcentualEvaluacion = e.ValorPorcentual,
                        EsGrupal = e.EsGrupal,
                        TieneEntregable = e.TieneEntregable,
                        CantEstudiantesGrupo = e.CantEstudiantesGrupo,
                        RutaEspecificacion = e.RutaEspecificacion,
                        PorcentajeObtenido = e.NotaEvaluaciones.FirstOrDefault()?.PorcentajeObtenido,
                        Observaciones = e.NotaEvaluaciones.FirstOrDefault()?.Observaciones,
                        RutaArchivoDetalles = e.NotaEvaluaciones.FirstOrDefault()?.RutaArchivoDetalles,
                        Publicada = e.NotaEvaluaciones.FirstOrDefault()?.Publicada ?? false
                    }).ToList()
                }).ToList()
            };

            decimal notaTotal = 0;
            foreach (var rubro in studentEvaluationsGradesDto.Rubros)
            {
                decimal totalRubro = 0;
                decimal maxPuntosRubro = 0;

                foreach (var evaluacion in rubro.Evaluaciones)
                {
                    if (evaluacion.TieneEntregable)
                    {
                        maxPuntosRubro += evaluacion.ValorPorcentualEvaluacion;
                        if (evaluacion.Publicada && evaluacion.PorcentajeObtenido.HasValue)
                        {
                            totalRubro += (evaluacion.PorcentajeObtenido.Value / 100m) * evaluacion.ValorPorcentualEvaluacion;
                        }
                    }
                }

                if (maxPuntosRubro > 0)
                {
                    notaTotal += (totalRubro / maxPuntosRubro) * rubro.PorcentajeRubro;
                }
            }

            studentEvaluationsGradesDto.NotaTotal = notaTotal;
            return studentEvaluationsGradesDto;
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