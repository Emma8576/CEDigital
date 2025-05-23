using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CEDigital.API.Data;
using CEDigital.API.Models;
using System.Threading.Tasks;
using System.Linq;

namespace CEDigital.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EntregaController : ControllerBase
    {
        private readonly CEDigitalContext _context;
        private readonly IWebHostEnvironment _env; // Para acceder a la ruta de uploads

        public EntregaController(CEDigitalContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // GET: api/Entrega/estado/5/2023298134
        [HttpGet("estado/{idEvaluacion}/{carnetEstudiante}")]
        public async Task<ActionResult<Entrega>> GetEstadoEntrega(int idEvaluacion, string carnetEstudiante)
        {
            // Lgica para verificar si el estudiante (o su grupo) ha entregado la evaluacin
            var entrega = await _context.Entregas
                .FirstOrDefaultAsync(e => e.IdEvaluacion == idEvaluacion &&
                                         (e.CarnetEstudiante == carnetEstudiante || 
                                          (_context.GrupoTrabajos.Any(gt => gt.IdGrupoTrabajo == e.IdGrupoTrabajo && gt.CarnetEstudiante == carnetEstudiante) && e.IdGrupoTrabajo != null)));

            if (entrega == null)
            {
                // Return 404 if no delivery is found, as expected by the frontend's error handling
                return NotFound("No se encontr informacin de entrega para esta evaluacin y estudiante.");
            }

            return entrega;
        }

        // POST: api/Entrega - Endpoint para subir un entregable
        [HttpPost]
        public async Task<IActionResult> UploadEntregable([FromForm] UploadEntregableDto dto)
        {
            if (dto.File == null || dto.File.Length == 0)
                return BadRequest("Debe subir un archivo.");

            // Validar si la evaluacin existe (esto s se puede hacer si Evaluaciones funciona)
            var evaluacion = await _context.Evaluaciones.FindAsync(dto.IdEvaluacion);
            if (evaluacion == null)
                return NotFound("Evaluacin no encontrada.");

            // Validar si es entrega grupal y se proporciona un idGrupoTrabajo (esto s se puede hacer si GrupoTrabajo funciona)
            if (evaluacion.EsGrupal && dto.IdGrupoTrabajo == null)
                return BadRequest("Para entregas grupales, debe proporcionar el IdGrupoTrabajo.");

            // Validar si el estudiante pertenece al grupo de trabajo si es grupal (esto s se puede hacer si GrupoTrabajo funciona)
            if (evaluacion.EsGrupal && dto.IdGrupoTrabajo != null)
            {
                 var perteneceGrupo = await _context.GrupoTrabajos.AnyAsync(gt => gt.IdGrupoTrabajo == dto.IdGrupoTrabajo && gt.CarnetEstudiante == dto.CarnetEstudiante);
                 if (!perteneceGrupo)
                      return Unauthorized("El estudiante no pertenece a este grupo de trabajo.");
            }

            // Validar si ya existe una entrega para esta evaluacin (individual o grupal)
            // TEMPORARILY COMMENTING OUT DB INTERACTION FOR EXISTING DELIVERY CHECK
            // var existingEntrega = await _context.Entregas
            //      .FirstOrDefaultAsync(e => e.IdEvaluacion == dto.IdEvaluacion &&
            //                               (evaluacion.EsGrupal ? e.IdGrupoTrabajo == dto.IdGrupoTrabajo : e.CarnetEstudiante == dto.CarnetEstudiante));

            // if (existingEntrega != null)
            // {
            //     // Puedes decidir si permites actualizar o no. Por ahora, no permitiremos.
            //     return Conflict("Ya existe una entrega para esta evaluacin.");
            // }

            // Guardar el archivo
            var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads/entregables"); // Asegura que esta ruta exista
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
            }
            catch (Exception ex)
            {
                 // Log the exception if logging is set up
                 // _logger.LogError(ex, "Error saving file {FileName}", uniqueFileName);
                 return StatusCode(500, "Error al guardar el archivo en el servidor.");
            }

            // Crear registro en la base de datos
            // TEMPORARILY COMMENTING OUT DB INTERACTION FOR SAVING DELIVERY INFO
            // var newEntrega = new Entrega
            // {
            //     IdEvaluacion = dto.IdEvaluacion,
            //     IdGrupoTrabajo = dto.IdGrupoTrabajo, // Ser null si es individual
            //     CarnetEstudiante = evaluacion.EsGrupal ? null : dto.CarnetEstudiante, // Ser null si es grupal
            //     FechaEntrega = DateTime.Now,
            //     RutaEntregable = Path.Combine("/uploads/entregables", uniqueFileName), // Guardar la ruta relativa o base
            //     Evaluacion = evaluacion,
            //     GrupoTrabajo = dto.IdGrupoTrabajo != null ? await _context.GrupoTrabajo.FindAsync(dto.IdGrupoTrabajo) : null
            // };

            // _context.Entregas.Add(newEntrega);
            // await _context.SaveChangesAsync();

            // Return a success response indicating the file was saved locally
            return Ok(new { message = "Archivo subido exitosamente (guardado localmente).", filePath = filePath });
        }

        // GET: api/Entrega/descargar/5 - Endpoint para descargar un entregable
        [HttpGet("descargar/{idEntrega}")]
        public async Task<IActionResult> DownloadEntregable(int idEntrega)
        {
            var entrega = await _context.Entregas.FindAsync(idEntrega);
            if (entrega == null)
            {
                return NotFound("Entrega no encontrada.");
            }

            var filePath = Path.Combine(_env.WebRootPath, entrega.RutaEntregable.TrimStart('/')); // Usa TrimStart para quitar la barra inicial si existe

            if (!System.IO.File.Exists(filePath))
            {
                return NotFound("Archivo de entregable no encontrado en el servidor.");
            }

            var memoryStream = new MemoryStream();
            using (var stream = new FileStream(filePath, FileMode.Open))
            {
                await stream.CopyToAsync(memoryStream);
            }
            memoryStream.Position = 0;

            // Obtener el nombre del archivo original si es posible, o usar el nombre de la ruta
            var fileName = Path.GetFileName(filePath);
            // Si guardaste el nombre original en la base de datos, saca de all
            // var fileName = entrega.NombreOriginalArchivo; // Si tuvieras este campo

            return File(memoryStream, "application/octet-stream", fileName); // application/octet-stream es un tipo genrico para descargar archivos
        }

        // TODO: Add other entrega endpoints if needed
    }
} 