using Microsoft.AspNetCore.Mvc;
using CEDigital.API.Data;
using CEDigital.API.Models;
using OfficeOpenXml;
using Microsoft.EntityFrameworkCore;

namespace CEDigital.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CargarSemestreController : ControllerBase
    {
        private readonly CEDigitalContext _context;

        public CargarSemestreController(CEDigitalContext context)
        {
            _context = context;
        }

        [HttpPost("cargar")]
        public async Task<IActionResult> CargarSemestreDesdeExcel(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Archivo no válido");

            try
            {
                using var stream = new MemoryStream();
                await file.CopyToAsync(stream);

                ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
                using var package = new ExcelPackage(stream);

                var hojaSemestre = package.Workbook.Worksheets["Semestre"];
                var hojaCursos = package.Workbook.Worksheets["Cursos"];
                var hojaGrupos = package.Workbook.Worksheets["Grupos"];
                var hojaEstudiantes = package.Workbook.Worksheets["EstudiantesGrupo"];

                // Crear Semestre
                var anio = Convert.ToInt32(hojaSemestre.Cells[2, 1].Text);
                var periodo = hojaSemestre.Cells[2, 2].Text;

                var semestre = new Semestre { Año = anio, Periodo = periodo };
                _context.Semestres.Add(semestre);
                await _context.SaveChangesAsync();

                int idSemestre = semestre.IdSemestre;

                // Insertar cursos
                for (int row = 2; hojaCursos.Cells[row, 1].Value != null; row++)
                {
                    var codigoCurso = hojaCursos.Cells[row, 1].Text;
                    var nombreCurso = hojaCursos.Cells[row, 2].Text;
                    var creditos = Convert.ToInt32(hojaCursos.Cells[row, 3].Text);
                    var nombreCarrera = hojaCursos.Cells[row, 4].Text;

                    var carrera = await _context.Carreras.FirstOrDefaultAsync(c => c.NombreCarrera == nombreCarrera);
                    if (carrera == null)
                    {
                        carrera = new Carrera { NombreCarrera = nombreCarrera };
                        _context.Carreras.Add(carrera);
                        await _context.SaveChangesAsync();
                    }

                    var curso = await _context.Cursos.FindAsync(codigoCurso);
                    if (curso == null)
                    {
                        curso = new Curso
                        {
                            CodigoCurso = codigoCurso,
                            NombreCurso = nombreCurso,
                            Creditos = creditos,
                            IdCarrera = carrera.IdCarrera,
                            Carrera = carrera
                        };
                        _context.Cursos.Add(curso);
                        await _context.SaveChangesAsync();
                    }
                }

                // Insertar grupos, profesores, carpetas y rubros
                if (hojaGrupos != null)
                {
                    for (int row = 2; hojaGrupos.Cells[row, 1].Value != null; row++)
                    {
                        var codigoCurso = hojaGrupos.Cells[row, 1].Text;
                        var numeroGrupo = int.Parse(hojaGrupos.Cells[row, 2].Text);
                        var cedula1 = hojaGrupos.Cells[row, 3].Text;
                        var cedula2 = hojaGrupos.Cells[row, 4].Text;

                        var curso = await _context.Cursos.FindAsync(codigoCurso);
                        if (curso == null) continue;

                        var grupo = new Grupo
                        {
                            CodigoCurso = codigoCurso,
                            IdSemestre = idSemestre,
                            NumeroGrupo = numeroGrupo,
                            Curso = curso,
                            Semestre = semestre,
                            Estudiantes = new List<EstudianteGrupo>()
                        };
                        _context.Grupos.Add(grupo);
                        await _context.SaveChangesAsync();

                        if (!string.IsNullOrWhiteSpace(cedula1))
                        {
                            _context.ProfesorGrupos.Add(new ProfesorGrupo
                            {
                                IdGrupo = grupo.IdGrupo,
                                CedulaProfesor = cedula1,
                                Grupo = grupo
                            });
                        }

                        if (!string.IsNullOrWhiteSpace(cedula2))
                        {
                            _context.ProfesorGrupos.Add(new ProfesorGrupo
                            {
                                IdGrupo = grupo.IdGrupo,
                                CedulaProfesor = cedula2,
                                Grupo = grupo
                            });
                        }

                        // Crear carpetas por defecto
                        var nombresCarpetas = new[] { "Presentaciones", "Quices", "Proyectos", "Exámenes" };
                        foreach (var nombre in nombresCarpetas)
                        {
                            _context.Carpetas.Add(new Carpeta
                            {
                                NombreCarpeta = nombre,
                                IdGrupo = grupo.IdGrupo,
                                Grupo = grupo
                            });
                        }

                        // Crear rubros por defecto
                        var rubrosPorDefecto = new List<Rubro>
                        {
                            new Rubro { NombreRubro = "Quices", Porcentaje = 30, IdGrupo = grupo.IdGrupo, Grupo = grupo },
                            new Rubro { NombreRubro = "Exámenes", Porcentaje = 30, IdGrupo = grupo.IdGrupo, Grupo = grupo },
                            new Rubro { NombreRubro = "Proyectos", Porcentaje = 40, IdGrupo = grupo.IdGrupo, Grupo = grupo }
                        };
                        _context.Rubros.AddRange(rubrosPorDefecto);

                        await _context.SaveChangesAsync();
                    }
                }

                // Matricular estudiantes
                if (hojaEstudiantes != null)
                {
                    for (int row = 2; hojaEstudiantes.Cells[row, 1].Value != null; row++)
                    {
                        var codigoCurso = hojaEstudiantes.Cells[row, 1].Text;
                        var numeroGrupo = int.Parse(hojaEstudiantes.Cells[row, 2].Text);
                        var carnet = hojaEstudiantes.Cells[row, 3].Text;

                        var grupo = await _context.Grupos
                            .FirstOrDefaultAsync(g => g.CodigoCurso == codigoCurso && g.NumeroGrupo == numeroGrupo && g.IdSemestre == idSemestre);

                        if (grupo != null && !string.IsNullOrWhiteSpace(carnet))
                        {
                            _context.EstudianteGrupos.Add(new EstudianteGrupo
                            {
                                IdGrupo = grupo.IdGrupo,
                                CarnetEstudiante = carnet,
                                Grupo = grupo
                            });
                        }
                    }

                    await _context.SaveChangesAsync();
                }

                return Ok(new { message = "Semestre, cursos, grupos, profesores, carpetas, rubros y estudiantes cargados correctamente", idSemestre });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al procesar el archivo: {ex.Message}");
            }
        }
    }
}
