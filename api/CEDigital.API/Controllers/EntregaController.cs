using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CEDigital.API.Data;
using CEDigital.API.Models;
using System.Linq;
using System.Collections.Generic;
using System.IO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.StaticFiles;

namespace CEDigital.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EntregaController : ControllerBase
    {
        private readonly CEDigitalContext _context;
        private readonly IWebHostEnvironment _webHostEnvironment;

        public EntregaController(CEDigitalContext context, IWebHostEnvironment webHostEnvironment)
        {
            _context = context;
            _webHostEnvironment = webHostEnvironment;
        }

        [HttpGet("estado/{idEvaluacion}/{carnetEstudiante}")]
        public async Task<ActionResult<Entrega>> GetEstadoEntrega(int idEvaluacion, string carnetEstudiante)
        {
            var entrega = await _context.Entregas
                .FirstOrDefaultAsync(e => e.IdEvaluacion == idEvaluacion &&
                                         (e.CarnetEstudiante == carnetEstudiante || 
                                          (_context.GrupoTrabajos.Any(gt => gt.IdGrupoTrabajo == e.IdGrupoTrabajo && gt.CarnetEstudiante == carnetEstudiante) && e.IdGrupoTrabajo != null)));

            if (entrega == null)
            {
                return NotFound("No se encontró información de entrega para esta evaluación y estudiante.");
            }

            return entrega;
        }

        [HttpPost]
        public async Task<ActionResult<EntregaDto>> PostEntrega([FromForm] EntregaCreateDto dto, IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            var evaluacion = await _context.Evaluaciones
                .Include(e => e.Rubro)
                .FirstOrDefaultAsync(e => e.IdEvaluacion == dto.IdEvaluacion);

            if (evaluacion == null)
                return NotFound("La evaluación no existe.");

            if (evaluacion.EsGrupal)
            {
                 var perteneceGrupo = await _context.GrupoTrabajos.AnyAsync(gt => gt.IdGrupoTrabajo == dto.IdGrupoTrabajo && gt.CarnetEstudiante == dto.CarnetEstudiante);
                 if (!perteneceGrupo)
                      return Unauthorized("El estudiante no pertenece a este grupo de trabajo.");
            }
            
            var existingEntrega = await _context.Entregas
                  .FirstOrDefaultAsync(e => e.IdEvaluacion == dto.IdEvaluacion &&
                                           (evaluacion.EsGrupal ? e.IdGrupoTrabajo == dto.IdGrupoTrabajo : e.CarnetEstudiante == dto.CarnetEstudiante));

             if (existingEntrega != null)
             {
                return Conflict("Ya existe una entrega para esta evaluación.");
             }

            if (!evaluacion.EsGrupal)
            {
                if (string.IsNullOrEmpty(dto.CarnetEstudiante))
                    return BadRequest("Debe proporcionar el carnet del estudiante para una evaluación individual.");

                var idGrupo = evaluacion.Rubro.IdGrupo;
                bool estudianteValido = await _context.EstudianteGrupos
                    .AnyAsync(eg => eg.IdGrupo == idGrupo && eg.CarnetEstudiante == dto.CarnetEstudiante);

                if (!estudianteValido)
                    return BadRequest("El estudiante no pertenece al grupo correspondiente al rubro de esta evaluación.");

                dto.IdGrupoTrabajo = null;
            }
            else
            {
                if (dto.IdGrupoTrabajo == null)
                    return BadRequest("Debe proporcionar el IdGrupoTrabajo para una evaluación grupal.");

                bool grupoValido = await _context.GrupoTrabajos
                    .AnyAsync(gt => gt.IdEvaluacion == dto.IdEvaluacion && gt.IdGrupoTrabajo == dto.IdGrupoTrabajo);

                if (!grupoValido)
                    return BadRequest("El grupo de trabajo no existe para esta evaluación.");

                dto.CarnetEstudiante = null;
            }

            var uploadsFolder = Path.Combine(_webHostEnvironment.ContentRootPath, "Uploads");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var uniqueFileName = Guid.NewGuid().ToString() + "_" + file.FileName;
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            try
            {
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

                var entregaToSave = new Entrega
                {
                    IdEvaluacion = dto.IdEvaluacion,
                    IdGrupoTrabajo = dto.IdGrupoTrabajo,
                    CarnetEstudiante = dto.CarnetEstudiante,
                    FechaEntrega = DateTime.Now,
                    RutaEntregable = uniqueFileName
                };

                _context.Entregas.Add(entregaToSave);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetEntrega), new { id = entregaToSave.IdEntrega }, new EntregaDto
            {
                IdEntrega = entregaToSave.IdEntrega,
                IdEvaluacion = entregaToSave.IdEvaluacion,
                IdGrupoTrabajo = entregaToSave.IdGrupoTrabajo,
                CarnetEstudiante = entregaToSave.CarnetEstudiante,
                FechaEntrega = entregaToSave.FechaEntrega,
                RutaEntregable = entregaToSave.RutaEntregable
            });
            }
            catch (Exception)
            {
                return StatusCode(500, "Error al guardar el archivo en el servidor.");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<EntregaDto>> GetEntrega(int id)
        {
            var entrega = await _context.Entregas.FindAsync(id);

            if (entrega == null)
            {
                return NotFound();
            }

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

        [HttpPut("especificacion")]
        public async Task<IActionResult> UploadEspecificacionFile([FromForm] UploadEspecificacionDto dto)
        {
            if (dto.File == null || dto.File.Length == 0)
                return BadRequest("Debe subir un archivo.");

            var evaluacion = await _context.Evaluaciones.FindAsync(dto.IdEvaluacion);
            if (evaluacion == null)
                return NotFound("Evaluación no encontrada.");

            var uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, "uploads/especificaciones");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var uniqueFileName = Guid.NewGuid().ToString() + "_" + dto.File.FileName;
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            try
            {
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.File.CopyToAsync(fileStream);
                }

                evaluacion.RutaEspecificacion = uniqueFileName;
                await _context.SaveChangesAsync();

                return Ok(new { message = "Archivo de especificación subido exitosamente." });
            }
            catch (Exception)
            {
                return StatusCode(500, "Error al guardar el archivo de especificación.");
            }
        }
    }
} 