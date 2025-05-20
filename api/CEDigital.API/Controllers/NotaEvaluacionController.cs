using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CEDigital.API.Data;
using CEDigital.API.Models;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using CEDigital.API.Services; // Assuming a service for MongoDB access

namespace CEDigital.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotaEvaluacionController : ControllerBase
    {
        private readonly CEDigitalContext _context;
        private readonly MongoDBService _mongoDBService; // Assuming MongoDB service is available

        public NotaEvaluacionController(CEDigitalContext context, MongoDBService mongoDBService)
        {
            _context = context;
            _mongoDBService = mongoDBService;
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

        // GET: api/NotaEvaluacion/estudiante/{carnetEstudiante}/grupo/{idGrupo}/consolidado
        [HttpGet("estudiante/{carnetEstudiante}/grupo/{idGrupo}/consolidado")]
        public async Task<ActionResult<StudentEvaluationsGradesDto>> GetStudentEvaluationsAndGrades(string carnetEstudiante, int idGrupo)
        {
            // 1. Obtener informacin del estudiante de MongoDB
            var estudiante = await _mongoDBService.GetStudentByCarnetAsync(carnetEstudiante);
            if (estudiante == null)
            {
                return NotFound("Estudiante no encontrado.");
            }

            // 2. Obtener rubros y evaluaciones para el grupo, incluyendo notas del estudiante/grupo de trabajo
            var rubrosWithEvaluations = await _context.Rubros
                .Where(r => r.IdGrupo == idGrupo)
                .Include(r => r.Evaluaciones)
                    .ThenInclude(e => e.NotaEvaluaciones.Where(ne =>
                        // Filtrar notas que pertenecen al estudiante individual (si es evaluacin individual)
                        (e.EsGrupal == false && _context.Entregas.Any(ent => ent.IdEvaluacion == ne.IdEvaluacion && ent.CarnetEstudiante == carnetEstudiante)) ||
                        // O filtrar notas que pertenecen a un grupo de trabajo del estudiante (si es evaluacin grupal)
                        (e.EsGrupal == true && ne.IdGrupoTrabajoNavigation.EstudianteGrupoTrabajo.Any(egt => egt.CarnetEstudiante == carnetEstudiante))
                    ))
                .OrderBy(r => r.NombreRubro) // Ognizar rubros si es necesario
                .ToListAsync();

            if (!rubrosWithEvaluations.Any())
            {
                 // Podra ser que no haya rubros/evaluaciones an
                 // Devolver un DTO bsico con informacin del estudiante pero sin rubros/evaluaciones
                 return Ok(new StudentEvaluationsGradesDto
                 {
                     NombreEstudiante = estudiante.Nombre, // Asumiendo que el modelo de estudiante de MongoDB tiene una propiedad Nombre
                     NotaTotal = 0, // O algn valor por defecto
                     Rubros = new List<RubricWithEvaluationsDto>()
                 });
            }

            // 3. Construir el DTO consolidado
            var studentEvaluationsGradesDto = new StudentEvaluationsGradesDto
            {
                NombreEstudiante = estudiante.Nombre, // Asumiendo propiedad Nombre en modelo MongoDB
                Rubros = rubrosWithEvaluations.Select(r => new RubricWithEvaluationsDto
                {
                    IdRubro = r.IdRubro,
                    NombreRubro = r.NombreRubro,
                    PorcentajeRubro = (int)r.Porcentaje, // Convertir decimal a int si PorcentajeRubro es int en DTO
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
                        // Asignar detalles de la nota si existen (tomar la primera nota encontrada, ya que esperamos solo una por estudiante/grupo)
                        PorcentajeObtenido = e.NotaEvaluaciones.FirstOrDefault()?.PorcentajeObtenido,
                        Observaciones = e.NotaEvaluaciones.FirstOrDefault()?.Observaciones,
                        RutaArchivoDetalles = e.NotaEvaluaciones.FirstOrDefault()?.RutaArchivoDetalles,
                        Publicada = e.NotaEvaluaciones.FirstOrDefault()?.Publicada ?? false // Asumir false si no hay nota

                        // TODO: Add deliverable details if needed later
                    }).ToList()
                }).ToList()
            };

            // 4. Calcular Nota Total (sumatoria ponderada de notas publicadas)
            decimal notaTotal = 0;
            foreach (var rubro in studentEvaluationsGradesDto.Rubros)
            {
                decimal totalRubro = 0;
                foreach (var evaluacion in rubro.Evaluaciones)
                {
                    // Solo considerar notas publicadas
                    if (evaluacion.Publicada && evaluacion.PorcentajeObtenido.HasValue)
                    {
                        // Calcular contribucin de la evaluacin al rubro: (NotaObtenida / 100) * ValorPorcentualEvaluacion
                         // Asegurarse de que ValorPorcentualEvaluacion sea interpretado correctamente (como porcentaje del rubro)
                         // Y que el PorcentajeObtenido es el porcentaje de la evaluacin

                        // Asumiendo que ValorPorcentualEvaluacion es el peso dentro del rubro (ej: 15 para un quiz)
                        // y que PorcentajeObtenido es la nota del estudiante en esa evaluacin (ej: 85.50)

                        // Contribucin al rubro = (PorcentajeObtenido / 100) * ValorPorcentualEvaluacion
                         totalRubro += (evaluacion.PorcentajeObtenido.Value / 100m) * evaluacion.ValorPorcentualEvaluacion;
                    }
                }
                 // Contribucin del rubro a la nota total: (TotalRubro / SumaTotalValorPorcentualEvaluacionesEnRubro) * PorcentajeRubro
                 // Necesitamos la suma total de ValorPorcentualEvaluacion para este rubro
                 decimal sumaTotalValorPorcentualEvaluacionesEnRubro = rubro.Evaluaciones.Sum(e => e.ValorPorcentualEvaluacion);

                 if(sumaTotalValorPorcentualEvaluacionesEnRubro > 0) // Evitar divisin por cero
                 {
                     notaTotal += (totalRubro / sumaTotalValorPorcentualEvaluacionesEnRubro) * rubro.PorcentajeRubro;
                 }


                // // Asumiendo que PorcentajeRubro es el peso del rubro en el curso (ej: 30 para quices)
                // // y totalRubro ya es la suma de las notas ponderadas dentro del rubro

                // // Contribucin al curso = (TotalRubro / Suma de pesos de evaluaciones en Rubro?) * PorcentajeRubro
                // // Esto depende de cmo se calcula exactamente la nota del rubro y luego la nota final
                // // Si totalRubro es la nota final del rubro sobre 100, entonces:
                // // notaTotal += (totalRubro / 100m) * rubro.PorcentajeRubro;

                // // Si totalRubro es la suma de las contribuciones (PorcentajeObtenido * ValorPorcentualEvaluacion) como se calcul arriba:
                // // Y PorcentajeRubro es el peso del rubro en el curso sobre 100
                // // Entonces la contribucin del rubro al curso es simplemente totalRubro * (rubro.PorcentajeRubro / 100m)
                // // Pero esto no cuadra con la imagen que muestra 0.00/10, 2.00/10 etc.

                // // Intentemos otra interpretacin: totalRubro es la suma de los puntos obtenidos en las evaluaciones publicadas del rubro.
                // // ValorPorcentualEvaluacion es la cantidad de puntos que da cada evaluacin.
                // // PorcentajeRubro es el total de puntos que da el rubro en el curso.
                // // Nota del Rubro = (Puntos obtenidos en Rubro / Total de puntos posibles en Rubro) * Total de puntos del Rubro en el curso


                // Recalcular totalRubro asumiendo ValorPorcentualEvaluacion es puntos y PorcentajeObtenido es % de esos puntos
                 totalRubro = 0;
                 decimal maxPuntosRubro = 0; // Suma de ValorPorcentualEvaluacion para todas las evaluaciones en el rubro

                 foreach(var evaluacion in rubro.Evaluaciones)
                 {
                     if(evaluacion.TieneEntregable)
                     {
                         maxPuntosRubro += evaluacion.ValorPorcentualEvaluacion; // Sumar los puntos mximos posibles de evaluaciones con entregable
                         if(evaluacion.Publicada && evaluacion.PorcentajeObtenido.HasValue)
                         {
                            // Si PorcentajeObtenido es 85.50, significa 85.50% de ValorPorcentualEvaluacion
                            totalRubro += (evaluacion.PorcentajeObtenido.Value / 100m) * evaluacion.ValorPorcentualEvaluacion;
                         }
                     }
                     // Si la evaluacin no tiene entregable, su valor podra ser solo informativo o 0 puntos en el rubro?
                 }

                 // Calcular contribucin del rubro a la nota total del curso
                 if (maxPuntosRubro > 0) // Evitar divisin por cero
                 {
                     // Contribucin = (Puntos obtenidos en Rubro / Mximos puntos posibles en Rubro) * Peso del Rubro en el curso
                     notaTotal += (totalRubro / maxPuntosRubro) * rubro.PorcentajeRubro; // Aqu PorcentajeRubro es el peso sobre 100 del curso
                 }



            }

            studentEvaluationsGradesDto.NotaTotal = notaTotal;

            return studentEvaluationsGradesDto;
        }

        // TODO: Add other NotaEvaluacion endpoints if needed
    }
} 