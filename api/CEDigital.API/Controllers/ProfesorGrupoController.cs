using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CEDigital.API.Models;
using CEDigital.API.Data;
using System.Collections.Generic;

namespace CEDigital.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProfesorGrupoController : ControllerBase
    {
        private readonly CEDigitalContext _context;

        public ProfesorGrupoController(CEDigitalContext context)
        {
            _context = context;
        }

        // GET: api/ProfesorGrupo
        [HttpGet] //devuelve todos los profesores por grupo y toda la info relacionada del curso, grupo, carrera, y semestre
        public async Task<ActionResult<IEnumerable<ProfesorGrupo>>> GetTodos()
        {
            var lista = await _context.ProfesorGrupos
                                            .Include(pg => pg.Grupo)
                                                .ThenInclude(g => g.Curso)
                                                    .ThenInclude(c => c.Carrera)
                                            .Include(pg => pg.Grupo)
                                                .ThenInclude(g => g.Semestre)
                                            .ToListAsync();

            return Ok(lista);
        }

        // GET: api/ProfesorGrupo/5
        [HttpGet("{idGrupo}")] // Devuelve las cédulas de los profesores por ID del grupo
        public async Task<ActionResult<IEnumerable<string>>> GetProfesoresDeGrupo(int idGrupo)
        {
            // Verificar si el grupo existe
            var grupoExiste = await _context.Grupos.AnyAsync(g => g.IdGrupo == idGrupo);
            if (!grupoExiste)
                return NotFound($"El grupo con ID {idGrupo} no existe.");

            // Obtener las cédulas de los profesores asignados
            var profesores = await _context.ProfesorGrupos
                .Where(pg => pg.IdGrupo == idGrupo)
                .Select(pg => pg.CedulaProfesor)
                .ToListAsync();

            // Siempre devolver 200 OK, incluso si la lista está vacía
            return Ok(profesores);
        }


        // POST: api/ProfesorGrupo
        [HttpPost] //Agrega un profesor a un grupo, verifica que no hayan mas de 2
        public async Task<IActionResult> PostProfesoresGrupo(ProfesorGrupoCreateDto dto)
        {
            var grupo = await _context.Grupos.FindAsync(dto.IdGrupo);
            if (grupo == null)
                return NotFound($"Grupo con ID {dto.IdGrupo} no existe.");

            // Contar profesores actuales asignados al grupo
            var profesoresActualesCount = await _context.ProfesorGrupos
                .CountAsync(pg => pg.IdGrupo == dto.IdGrupo);

            // Cuantos profesores quiere asignar el usuario
            int nuevosProfesoresCount = dto.CedulasProfesores.Count();

            if (profesoresActualesCount + nuevosProfesoresCount > 2)
            {
                return BadRequest($"No se pueden asignar más de 2 profesores al grupo {dto.IdGrupo}. " +
                                $"Actualmente tiene {profesoresActualesCount} profesor(es) asignado(s).");
            }

            var asignaciones = dto.CedulasProfesores.Select(cedula => new ProfesorGrupo
            {
                IdGrupo = dto.IdGrupo,
                CedulaProfesor = cedula,
                Grupo = grupo
            });

            await _context.ProfesorGrupos.AddRangeAsync(asignaciones);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException e)
            {
                return Conflict("Algunos profesores ya estaban asignados a este grupo. " + e.Message);
            }

            return Ok("Profesores asignados correctamente.");
        }


        // PUT: api/ProfesorGrupo/5
        [HttpPut("{idGrupo}")] //Modifica los profes asignados a un grupo
        public async Task<IActionResult> PutProfesoresGrupo(int idGrupo, ProfesorGrupoUpdateDto dto)
        {
            var grupo = await _context.Grupos.FindAsync(idGrupo);
            if (grupo == null)
                return NotFound($"Grupo con ID {idGrupo} no existe.");

            var existentes = await _context.ProfesorGrupos
                .Where(pg => pg.IdGrupo == idGrupo)
                .ToListAsync();

            _context.ProfesorGrupos.RemoveRange(existentes);

            var nuevos = dto.CedulasProfesores.Select(cedula => new ProfesorGrupo
            {
                IdGrupo = idGrupo,
                CedulaProfesor = cedula,
                Grupo = grupo
            });

            await _context.ProfesorGrupos.AddRangeAsync(nuevos);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException e)
            {
                return BadRequest("Error al actualizar profesores. " + e.Message);
            }

            return NoContent();
        }

        // DELETE: api/ProfesorGrupo/5/12345678
        [HttpDelete("{idGrupo}/{cedulaProfesor}")] //Borra solo un profe especifico del grupo
        public async Task<IActionResult> DeleteUno(int idGrupo, string cedulaProfesor)
        {
            var entry = await _context.ProfesorGrupos
                .FirstOrDefaultAsync(pg => pg.IdGrupo == idGrupo && pg.CedulaProfesor == cedulaProfesor);

            if (entry == null)
                return NotFound("Asignación no encontrada.");

            _context.ProfesorGrupos.Remove(entry);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/ProfesorGrupo/5
        [HttpDelete("{idGrupo}")] //Borra TODOS los profes asignados a un grupo
        public async Task<IActionResult> DeleteTodos(int idGrupo)
        {
            var entries = await _context.ProfesorGrupos
                .Where(pg => pg.IdGrupo == idGrupo)
                .ToListAsync();

            if (entries.Count == 0)
                return NotFound("No hay profesores asignados a este grupo.");

            _context.ProfesorGrupos.RemoveRange(entries);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        
    }
}
