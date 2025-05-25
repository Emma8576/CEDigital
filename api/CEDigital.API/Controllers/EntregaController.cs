using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CEDigital.API.Data;
using CEDigital.API.Models;
using System.Linq;
using System.Collections.Generic;
using System.IO; // Required for file operations
using Microsoft.AspNetCore.Http; // Required for IFormFile
using Microsoft.AspNetCore.StaticFiles; // Required for FileExtensionContentTypeProvider

namespace CEDigital.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EntregaController : ControllerBase
    {
        private readonly CEDigitalContext _context;
        private readonly IWebHostEnvironment _webHostEnvironment; // Inject IWebHostEnvironment

        public EntregaController(CEDigitalContext context, IWebHostEnvironment webHostEnvironment)
        {
            _context = context;
            _webHostEnvironment = webHostEnvironment;
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

            Entrega existingEntrega = null; // Declare existingEntrega here

            // Determine if it's an individual or group submission and validate
            if (!evaluacion.EsGrupal)
            {
                if (string.IsNullOrEmpty(dto.CarnetEstudiante))
                    return BadRequest("Debe proporcionar el carnet del estudiante para una evaluación individual.");

                var idGrupo = evaluacion.Rubro.IdGrupo;

                bool estudianteValido = await _context.EstudianteGrupos
                    .AnyAsync(eg => eg.IdGrupo == idGrupo && eg.CarnetEstudiante == dto.CarnetEstudiante);

                if (!estudianteValido)
                    return BadRequest("El estudiante no pertenece al grupo correspondiente al rubro de esta evaluación.");

                // Ignorar IdGrupoTrabajo for individual
                dto.IdGrupoTrabajo = null;

                 // Check if an delivery already exists for this individual student and evaluation
                existingEntrega = await _context.Entregas // Assign to the declared variable
                    .FirstOrDefaultAsync(e => e.IdEvaluacion == dto.IdEvaluacion && e.CarnetEstudiante == dto.CarnetEstudiante);

                 if (existingEntrega != null)
                 {
                     // If exists, delete the old file if it exists before saving the new one
                      if (!string.IsNullOrEmpty(existingEntrega.RutaEntregable))
                      {
                          var oldFilePath = Path.Combine(_webHostEnvironment.ContentRootPath, "Uploads", existingEntrega.RutaEntregable);
                           if (System.IO.File.Exists(oldFilePath))
                           {
                               System.IO.File.Delete(oldFilePath);
                           }
                      }
                 }

            }
            else // Es Grupal
            {
                if (dto.IdGrupoTrabajo == null)
                    return BadRequest("Debe proporcionar el IdGrupoTrabajo para una evaluación grupal.");

                bool grupoValido = await _context.GrupoTrabajos
                    .AnyAsync(gt => gt.IdEvaluacion == dto.IdEvaluacion && gt.IdGrupoTrabajo == dto.IdGrupoTrabajo);

                if (!grupoValido)
                    return BadRequest("El grupo de trabajo no existe para esta evaluación.");

                // Ignorar CarnetEstudiante for group
                dto.CarnetEstudiante = null;

                // Check if an delivery already exists for this group and evaluation
                 existingEntrega = await _context.Entregas // Assign to the declared variable
                     .FirstOrDefaultAsync(e => e.IdEvaluacion == dto.IdEvaluacion && e.IdGrupoTrabajo == dto.IdGrupoTrabajo);

                 if (existingEntrega != null)
                 {
                      // If exists, delete the old file if it exists before saving the new one
                       if (!string.IsNullOrEmpty(existingEntrega.RutaEntregable))
                       {
                           var oldFilePath = Path.Combine(_webHostEnvironment.ContentRootPath, "Uploads", existingEntrega.RutaEntregable);
                            if (System.IO.File.Exists(oldFilePath))
                            {
                                System.IO.File.Delete(oldFilePath);
                            }
                       }
                 }
            }

            // Save the file to a local folder
            var uploadsFolder = Path.Combine(_webHostEnvironment.ContentRootPath, "Uploads");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            // Generate a unique file name
            var uniqueFileName = Guid.NewGuid().ToString() + "_" + file.FileName;
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Create or update the Entrega record
            Entrega entregaToSave;
            if (existingEntrega != null)
            {
                // Update existing delivery
                entregaToSave = existingEntrega;
                entregaToSave.FechaEntrega = DateTime.Now; // Update with current time
                // Store only the file name relative to the uploads folder
                entregaToSave.RutaEntregable = uniqueFileName;
                _context.Entregas.Update(entregaToSave);
            }
            else
            {
                // Create new delivery
                entregaToSave = new Entrega
                {
                    IdEvaluacion = dto.IdEvaluacion,
                    IdGrupoTrabajo = dto.IdGrupoTrabajo, // This will be null for individual
                    CarnetEstudiante = dto.CarnetEstudiante, // This will be null for group
                    FechaEntrega = DateTime.Now, // Set current time
                    // Store only the file name relative to the uploads folder
                    RutaEntregable = uniqueFileName
                };
                _context.Entregas.Add(entregaToSave);
            }

            await _context.SaveChangesAsync();

            // Return the saved/updated delivery mapped to DTO
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

        // GET: api/Entrega/estado/{evaluationId}/{carnetEstudiante}
        [HttpGet("estado/{evaluationId}/{carnetEstudiante}")] // Busca el estado de entrega para una evaluación y estudiante específicos
        public async Task<ActionResult<EntregaDto>> GetEstadoEntrega(int evaluationId, string carnetEstudiante)
        {
            // Primero, verificar si la evaluación existe y si es grupal o individual
            var evaluacion = await _context.Evaluaciones.FindAsync(evaluationId);

            if (evaluacion == null)
            {
                return NotFound("Evaluación no encontrada.");
            }

            Entrega entrega = null;

            if (evaluacion.EsGrupal)
            {
                // Para evaluaciones grupales, encontrar el IdGrupoTrabajo del estudiante para esta evaluación
                var grupoTrabajo = await _context.GrupoTrabajos
                    .FirstOrDefaultAsync(gt => gt.IdEvaluacion == evaluationId && gt.CarnetEstudiante == carnetEstudiante);

                if (grupoTrabajo != null)
                {
                    // Buscar la entrega para el grupo de trabajo
                    entrega = await _context.Entregas
                        .FirstOrDefaultAsync(e => e.IdEvaluacion == evaluationId && e.IdGrupoTrabajo == grupoTrabajo.IdGrupoTrabajo);
                }
            }
            else
            {
                // Para evaluaciones individuales, buscar la entrega directamente por carnet de estudiante
                entrega = await _context.Entregas
                    .FirstOrDefaultAsync(e => e.IdEvaluacion == evaluationId && e.CarnetEstudiante == carnetEstudiante);
            }

            if (entrega == null)
            {
                // Si no se encuentra la entrega, retornar 404
                return NotFound("Entrega no encontrada para esta evaluación y estudiante/grupo.");
            }

            // Mapear a DTO y retornar la entrega encontrada
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

        // GET: api/Entrega/descargar/5
        [HttpGet("descargar/{id}")]
        public async Task<IActionResult> DownloadEntrega(int id)
        {
            var entrega = await _context.Entregas.FindAsync(id);

            if (entrega == null || string.IsNullOrEmpty(entrega.RutaEntregable))
            {
                return NotFound("Entrega o archivo no encontrado.");
            }

            var uploadsFolder = Path.Combine(_webHostEnvironment.ContentRootPath, "Uploads");
            var filePath = Path.Combine(uploadsFolder, entrega.RutaEntregable);

            if (!System.IO.File.Exists(filePath))
            {
                return NotFound("Archivo no encontrado en el servidor.");
            }

            // Determine the content type (MIME type) based on the file extension
            var provider = new FileExtensionContentTypeProvider();
            if (!provider.TryGetContentType(entrega.RutaEntregable, out var contentType))
            {
                contentType = "application/octet-stream"; // Default MIME type
            }

            // Return the file for download with the original filename
            var originalFileName = entrega.RutaEntregable.Substring(entrega.RutaEntregable.IndexOf('_') + 1);
            return PhysicalFile(filePath, contentType, originalFileName);
        }
    }
}
