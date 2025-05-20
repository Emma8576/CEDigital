using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CEDigital.API.Migrations
{
    /// <inheritdoc />
    public partial class AddRequiredColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Carrera",
                columns: table => new
                {
                    IdCarrera = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NombreCarrera = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Carrera", x => x.IdCarrera);
                });

            migrationBuilder.CreateTable(
                name: "Curso",
                columns: table => new
                {
                    CodigoCurso = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    NombreCurso = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Creditos = table.Column<int>(type: "int", nullable: false),
                    IdCarrera = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Curso", x => x.CodigoCurso);
                    table.ForeignKey(
                        name: "FK_Curso_Carrera_IdCarrera",
                        column: x => x.IdCarrera,
                        principalTable: "Carrera",
                        principalColumn: "IdCarrera",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Semestre",
                columns: table => new
                {
                    IdSemestre = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Periodo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Año = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CodigoCurso = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CodigoCursoNavigation = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    IdSemestreNavigation = table.Column<int>(type: "int", nullable: true),
                    SemestreNavigationIdSemestre = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Semestre", x => x.IdSemestre);
                    table.ForeignKey(
                        name: "FK_Semestre_Curso_CodigoCursoNavigation",
                        column: x => x.CodigoCursoNavigation,
                        principalTable: "Curso",
                        principalColumn: "CodigoCurso",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Semestre_Semestre_SemestreNavigationIdSemestre",
                        column: x => x.SemestreNavigationIdSemestre,
                        principalTable: "Semestre",
                        principalColumn: "IdSemestre");
                });

            migrationBuilder.CreateTable(
                name: "Grupo",
                columns: table => new
                {
                    IdGrupo = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CodigoCurso = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CodigoCursoNavigation = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    IdSemestre = table.Column<int>(type: "int", nullable: false),
                    NumeroGrupo = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Grupo", x => x.IdGrupo);
                    table.ForeignKey(
                        name: "FK_Grupo_Curso_CodigoCursoNavigation",
                        column: x => x.CodigoCursoNavigation,
                        principalTable: "Curso",
                        principalColumn: "CodigoCurso",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Grupo_Semestre_IdSemestre",
                        column: x => x.IdSemestre,
                        principalTable: "Semestre",
                        principalColumn: "IdSemestre",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Carpeta",
                columns: table => new
                {
                    IdCarpeta = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NombreCarpeta = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IdGrupo = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Carpeta", x => x.IdCarpeta);
                    table.ForeignKey(
                        name: "FK_Carpeta_Grupo_IdGrupo",
                        column: x => x.IdGrupo,
                        principalTable: "Grupo",
                        principalColumn: "IdGrupo",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EstudianteGrupo",
                columns: table => new
                {
                    CarnetEstudiante = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    IdGrupo = table.Column<int>(type: "int", nullable: false),
                    Id = table.Column<int>(type: "int", nullable: false),
                    CarnetsEstudiantes = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EstudianteGrupo", x => new { x.IdGrupo, x.CarnetEstudiante });
                    table.ForeignKey(
                        name: "FK_EstudianteGrupo_Grupo_IdGrupo",
                        column: x => x.IdGrupo,
                        principalTable: "Grupo",
                        principalColumn: "IdGrupo",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Noticia",
                columns: table => new
                {
                    IdNoticia = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Titulo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Mensaje = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FechaPublicacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IdGrupo = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Noticia", x => x.IdNoticia);
                    table.ForeignKey(
                        name: "FK_Noticia_Grupo_IdGrupo",
                        column: x => x.IdGrupo,
                        principalTable: "Grupo",
                        principalColumn: "IdGrupo",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProfesorGrupo",
                columns: table => new
                {
                    CedulaProfesor = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    IdGrupo = table.Column<int>(type: "int", nullable: false),
                    CedulasProfesores = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProfesorGrupo", x => new { x.IdGrupo, x.CedulaProfesor });
                    table.ForeignKey(
                        name: "FK_ProfesorGrupo_Grupo_IdGrupo",
                        column: x => x.IdGrupo,
                        principalTable: "Grupo",
                        principalColumn: "IdGrupo",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Rubros",
                columns: table => new
                {
                    IdRubro = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NombreRubro = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Porcentaje = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IdGrupo = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Rubros", x => x.IdRubro);
                    table.ForeignKey(
                        name: "FK_Rubros_Grupo_IdGrupo",
                        column: x => x.IdGrupo,
                        principalTable: "Grupo",
                        principalColumn: "IdGrupo",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Archivos",
                columns: table => new
                {
                    IdArchivo = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NombreArchivo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FechaSubida = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TamañoArchivo = table.Column<long>(type: "bigint", nullable: false),
                    IdCarpeta = table.Column<int>(type: "int", nullable: false),
                    Ruta = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Archivos", x => x.IdArchivo);
                    table.ForeignKey(
                        name: "FK_Archivos_Carpeta_IdCarpeta",
                        column: x => x.IdCarpeta,
                        principalTable: "Carpeta",
                        principalColumn: "IdCarpeta",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Evaluaciones",
                columns: table => new
                {
                    IdEvaluacion = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdRubro = table.Column<int>(type: "int", nullable: false),
                    IdRubroNavigationIdRubro = table.Column<int>(type: "int", nullable: false),
                    NombreEvaluacion = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FechaHoraLimite = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ValorPorcentual = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    EsGrupal = table.Column<bool>(type: "bit", nullable: false),
                    TieneEntregable = table.Column<bool>(type: "bit", nullable: false),
                    CantEstudiantesGrupo = table.Column<int>(type: "int", nullable: true),
                    RutaEspecificacion = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Evaluaciones", x => x.IdEvaluacion);
                    table.ForeignKey(
                        name: "FK_Evaluaciones_Rubros_IdRubroNavigationIdRubro",
                        column: x => x.IdRubroNavigationIdRubro,
                        principalTable: "Rubros",
                        principalColumn: "IdRubro",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GrupoTrabajo",
                columns: table => new
                {
                    IdGrupoTrabajo = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdEvaluacion = table.Column<int>(type: "int", nullable: false),
                    CarnetEstudiante = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GrupoTrabajo", x => x.IdGrupoTrabajo);
                    table.ForeignKey(
                        name: "FK_GrupoTrabajo_Evaluaciones_IdEvaluacion",
                        column: x => x.IdEvaluacion,
                        principalTable: "Evaluaciones",
                        principalColumn: "IdEvaluacion",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Entregas",
                columns: table => new
                {
                    IdEntrega = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdEvaluacion = table.Column<int>(type: "int", nullable: false),
                    IdGrupoTrabajo = table.Column<int>(type: "int", nullable: true),
                    CarnetEstudiante = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FechaEntrega = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RutaEntregable = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entregas", x => x.IdEntrega);
                    table.ForeignKey(
                        name: "FK_Entregas_Evaluaciones_IdEvaluacion",
                        column: x => x.IdEvaluacion,
                        principalTable: "Evaluaciones",
                        principalColumn: "IdEvaluacion",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Entregas_GrupoTrabajo_IdGrupoTrabajo",
                        column: x => x.IdGrupoTrabajo,
                        principalTable: "GrupoTrabajo",
                        principalColumn: "IdGrupoTrabajo");
                });

            migrationBuilder.CreateTable(
                name: "EstudianteGrupoTrabajo",
                columns: table => new
                {
                    IdGrupoTrabajo = table.Column<int>(type: "int", nullable: false),
                    CarnetEstudiante = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EstudianteGrupoTrabajo", x => new { x.IdGrupoTrabajo, x.CarnetEstudiante });
                    table.ForeignKey(
                        name: "FK_EstudianteGrupoTrabajo_GrupoTrabajo_IdGrupoTrabajo",
                        column: x => x.IdGrupoTrabajo,
                        principalTable: "GrupoTrabajo",
                        principalColumn: "IdGrupoTrabajo",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "NotaEvaluaciones",
                columns: table => new
                {
                    IdNotaEvaluacion = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PorcentajeObtenido = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Observaciones = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RutaArchivoDetalles = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Publicada = table.Column<bool>(type: "bit", nullable: false),
                    IdEvaluacion = table.Column<int>(type: "int", nullable: false),
                    IdEvaluacionNavigationIdEvaluacion = table.Column<int>(type: "int", nullable: false),
                    IdGrupoTrabajo = table.Column<int>(type: "int", nullable: true),
                    IdGrupoTrabajoNavigationIdGrupoTrabajo = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotaEvaluaciones", x => x.IdNotaEvaluacion);
                    table.ForeignKey(
                        name: "FK_NotaEvaluaciones_Evaluaciones_IdEvaluacionNavigationIdEvaluacion",
                        column: x => x.IdEvaluacionNavigationIdEvaluacion,
                        principalTable: "Evaluaciones",
                        principalColumn: "IdEvaluacion",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_NotaEvaluaciones_GrupoTrabajo_IdGrupoTrabajoNavigationIdGrupoTrabajo",
                        column: x => x.IdGrupoTrabajoNavigationIdGrupoTrabajo,
                        principalTable: "GrupoTrabajo",
                        principalColumn: "IdGrupoTrabajo",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Archivos_IdCarpeta",
                table: "Archivos",
                column: "IdCarpeta");

            migrationBuilder.CreateIndex(
                name: "IX_Carpeta_IdGrupo",
                table: "Carpeta",
                column: "IdGrupo");

            migrationBuilder.CreateIndex(
                name: "IX_Curso_IdCarrera",
                table: "Curso",
                column: "IdCarrera");

            migrationBuilder.CreateIndex(
                name: "IX_Entregas_IdEvaluacion",
                table: "Entregas",
                column: "IdEvaluacion");

            migrationBuilder.CreateIndex(
                name: "IX_Entregas_IdGrupoTrabajo",
                table: "Entregas",
                column: "IdGrupoTrabajo");

            migrationBuilder.CreateIndex(
                name: "IX_Evaluaciones_IdRubroNavigationIdRubro",
                table: "Evaluaciones",
                column: "IdRubroNavigationIdRubro");

            migrationBuilder.CreateIndex(
                name: "IX_Grupo_CodigoCursoNavigation",
                table: "Grupo",
                column: "CodigoCursoNavigation");

            migrationBuilder.CreateIndex(
                name: "IX_Grupo_IdSemestre",
                table: "Grupo",
                column: "IdSemestre");

            migrationBuilder.CreateIndex(
                name: "IX_GrupoTrabajo_IdEvaluacion",
                table: "GrupoTrabajo",
                column: "IdEvaluacion");

            migrationBuilder.CreateIndex(
                name: "IX_NotaEvaluaciones_IdEvaluacionNavigationIdEvaluacion",
                table: "NotaEvaluaciones",
                column: "IdEvaluacionNavigationIdEvaluacion");

            migrationBuilder.CreateIndex(
                name: "IX_NotaEvaluaciones_IdGrupoTrabajoNavigationIdGrupoTrabajo",
                table: "NotaEvaluaciones",
                column: "IdGrupoTrabajoNavigationIdGrupoTrabajo");

            migrationBuilder.CreateIndex(
                name: "IX_Noticia_IdGrupo",
                table: "Noticia",
                column: "IdGrupo");

            migrationBuilder.CreateIndex(
                name: "IX_Rubros_IdGrupo",
                table: "Rubros",
                column: "IdGrupo");

            migrationBuilder.CreateIndex(
                name: "IX_Semestre_CodigoCursoNavigation",
                table: "Semestre",
                column: "CodigoCursoNavigation");

            migrationBuilder.CreateIndex(
                name: "IX_Semestre_SemestreNavigationIdSemestre",
                table: "Semestre",
                column: "SemestreNavigationIdSemestre");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Archivos");

            migrationBuilder.DropTable(
                name: "Entregas");

            migrationBuilder.DropTable(
                name: "EstudianteGrupo");

            migrationBuilder.DropTable(
                name: "EstudianteGrupoTrabajo");

            migrationBuilder.DropTable(
                name: "NotaEvaluaciones");

            migrationBuilder.DropTable(
                name: "Noticia");

            migrationBuilder.DropTable(
                name: "ProfesorGrupo");

            migrationBuilder.DropTable(
                name: "Carpeta");

            migrationBuilder.DropTable(
                name: "GrupoTrabajo");

            migrationBuilder.DropTable(
                name: "Evaluaciones");

            migrationBuilder.DropTable(
                name: "Rubros");

            migrationBuilder.DropTable(
                name: "Grupo");

            migrationBuilder.DropTable(
                name: "Semestre");

            migrationBuilder.DropTable(
                name: "Curso");

            migrationBuilder.DropTable(
                name: "Carrera");
        }
    }
}
