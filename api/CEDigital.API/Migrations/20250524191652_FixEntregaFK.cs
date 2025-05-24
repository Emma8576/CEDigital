using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CEDigital.API.Migrations
{
    /// <inheritdoc />
    public partial class FixEntregaFK : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Archivos_Carpeta_IdCarpeta",
                table: "Archivos");

            migrationBuilder.DropForeignKey(
                name: "FK_Entregas_Evaluaciones_IdEvaluacion",
                table: "Entregas");

            migrationBuilder.DropForeignKey(
                name: "FK_Entregas_GrupoTrabajo_IdGrupoTrabajo",
                table: "Entregas");

            migrationBuilder.DropForeignKey(
                name: "FK_Evaluaciones_Rubros_IdRubroNavigationIdRubro",
                table: "Evaluaciones");

            migrationBuilder.DropForeignKey(
                name: "FK_Grupo_Curso_CodigoCursoNavigation",
                table: "Grupo");

            migrationBuilder.DropForeignKey(
                name: "FK_GrupoTrabajo_Evaluaciones_IdEvaluacion",
                table: "GrupoTrabajo");

            migrationBuilder.DropForeignKey(
                name: "FK_NotaEvaluaciones_Evaluaciones_IdEvaluacionNavigationIdEvaluacion",
                table: "NotaEvaluaciones");

            migrationBuilder.DropForeignKey(
                name: "FK_NotaEvaluaciones_GrupoTrabajo_IdGrupoTrabajoNavigationIdGrupoTrabajo",
                table: "NotaEvaluaciones");

            migrationBuilder.DropForeignKey(
                name: "FK_Rubros_Grupo_IdGrupo",
                table: "Rubros");

            migrationBuilder.DropForeignKey(
                name: "FK_Semestre_Curso_CodigoCursoNavigation",
                table: "Semestre");

            migrationBuilder.DropForeignKey(
                name: "FK_Semestre_Semestre_SemestreNavigationIdSemestre",
                table: "Semestre");

            migrationBuilder.DropIndex(
                name: "IX_Semestre_CodigoCursoNavigation",
                table: "Semestre");

            migrationBuilder.DropIndex(
                name: "IX_Semestre_SemestreNavigationIdSemestre",
                table: "Semestre");

            migrationBuilder.DropIndex(
                name: "IX_Grupo_CodigoCursoNavigation",
                table: "Grupo");

            migrationBuilder.DropPrimaryKey(
                name: "PK_EstudianteGrupoTrabajo",
                table: "EstudianteGrupoTrabajo");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Rubros",
                table: "Rubros");

            migrationBuilder.DropPrimaryKey(
                name: "PK_NotaEvaluaciones",
                table: "NotaEvaluaciones");

            migrationBuilder.DropIndex(
                name: "IX_NotaEvaluaciones_IdEvaluacionNavigationIdEvaluacion",
                table: "NotaEvaluaciones");

            migrationBuilder.DropIndex(
                name: "IX_NotaEvaluaciones_IdGrupoTrabajoNavigationIdGrupoTrabajo",
                table: "NotaEvaluaciones");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Evaluaciones",
                table: "Evaluaciones");

            migrationBuilder.DropIndex(
                name: "IX_Evaluaciones_IdRubroNavigationIdRubro",
                table: "Evaluaciones");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Entregas",
                table: "Entregas");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Archivos",
                table: "Archivos");

            migrationBuilder.DropColumn(
                name: "CodigoCurso",
                table: "Semestre");

            migrationBuilder.DropColumn(
                name: "CodigoCursoNavigation",
                table: "Semestre");

            migrationBuilder.DropColumn(
                name: "IdSemestreNavigation",
                table: "Semestre");

            migrationBuilder.DropColumn(
                name: "SemestreNavigationIdSemestre",
                table: "Semestre");

            migrationBuilder.DropColumn(
                name: "CodigoCursoNavigation",
                table: "Grupo");

            migrationBuilder.DropColumn(
                name: "CarnetsEstudiantes",
                table: "EstudianteGrupo");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "EstudianteGrupo");

            migrationBuilder.DropColumn(
                name: "IdEvaluacionNavigationIdEvaluacion",
                table: "NotaEvaluaciones");

            migrationBuilder.DropColumn(
                name: "IdGrupoTrabajoNavigationIdGrupoTrabajo",
                table: "NotaEvaluaciones");

            migrationBuilder.DropColumn(
                name: "IdRubroNavigationIdRubro",
                table: "Evaluaciones");

            migrationBuilder.DropColumn(
                name: "Descripcion",
                table: "Archivos");

            migrationBuilder.RenameTable(
                name: "Rubros",
                newName: "Rubro");

            migrationBuilder.RenameTable(
                name: "NotaEvaluaciones",
                newName: "NotaEvaluacion");

            migrationBuilder.RenameTable(
                name: "Evaluaciones",
                newName: "Evaluacion");

            migrationBuilder.RenameTable(
                name: "Entregas",
                newName: "Entrega");

            migrationBuilder.RenameTable(
                name: "Archivos",
                newName: "Archivo");

            migrationBuilder.RenameIndex(
                name: "IX_Rubros_IdGrupo",
                table: "Rubro",
                newName: "IX_Rubro_IdGrupo");

            migrationBuilder.RenameIndex(
                name: "IX_Entregas_IdGrupoTrabajo",
                table: "Entrega",
                newName: "IX_Entrega_IdGrupoTrabajo");

            migrationBuilder.RenameIndex(
                name: "IX_Entregas_IdEvaluacion",
                table: "Entrega",
                newName: "IX_Entrega_IdEvaluacion");

            migrationBuilder.RenameColumn(
                name: "FechaSubida",
                table: "Archivo",
                newName: "FechaPublicacion");

            migrationBuilder.RenameIndex(
                name: "IX_Archivos_IdCarpeta",
                table: "Archivo",
                newName: "IX_Archivo_IdCarpeta");

            migrationBuilder.AlterColumn<int>(
                name: "Año",
                table: "Semestre",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "CarnetEstudiante",
                table: "GrupoTrabajo",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "CodigoCurso",
                table: "Grupo",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "EstudianteGrupoTrabajo",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int")
                .Annotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AlterColumn<string>(
                name: "CarnetEstudiante",
                table: "EstudianteGrupoTrabajo",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AlterColumn<int>(
                name: "Porcentaje",
                table: "Rubro",
                type: "int",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)");

            migrationBuilder.AlterColumn<string>(
                name: "NombreRubro",
                table: "Rubro",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "RutaArchivoDetalles",
                table: "NotaEvaluacion",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "PorcentajeObtenido",
                table: "NotaEvaluacion",
                type: "decimal(5,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)");

            migrationBuilder.AlterColumn<string>(
                name: "Observaciones",
                table: "NotaEvaluacion",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CarnetEstudiante",
                table: "NotaEvaluacion",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ValorPorcentual",
                table: "Evaluacion",
                type: "int",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)");

            migrationBuilder.AlterColumn<string>(
                name: "RutaEspecificacion",
                table: "Evaluacion",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "NombreEvaluacion",
                table: "Evaluacion",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<int>(
                name: "CantEstudiantesGrupo",
                table: "Evaluacion",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "TamañoArchivo",
                table: "Archivo",
                type: "int",
                nullable: false,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.AddPrimaryKey(
                name: "PK_EstudianteGrupoTrabajo",
                table: "EstudianteGrupoTrabajo",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Rubro",
                table: "Rubro",
                column: "IdRubro");

            migrationBuilder.AddPrimaryKey(
                name: "PK_NotaEvaluacion",
                table: "NotaEvaluacion",
                column: "IdNotaEvaluacion");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Evaluacion",
                table: "Evaluacion",
                column: "IdEvaluacion");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Entrega",
                table: "Entrega",
                column: "IdEntrega");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Archivo",
                table: "Archivo",
                column: "IdArchivo");

            migrationBuilder.CreateIndex(
                name: "IX_Grupo_CodigoCurso",
                table: "Grupo",
                column: "CodigoCurso");

            migrationBuilder.CreateIndex(
                name: "IX_EstudianteGrupoTrabajo_IdGrupoTrabajo",
                table: "EstudianteGrupoTrabajo",
                column: "IdGrupoTrabajo");

            migrationBuilder.CreateIndex(
                name: "IX_NotaEvaluacion_IdEvaluacion",
                table: "NotaEvaluacion",
                column: "IdEvaluacion");

            migrationBuilder.CreateIndex(
                name: "IX_NotaEvaluacion_IdGrupoTrabajo",
                table: "NotaEvaluacion",
                column: "IdGrupoTrabajo");

            migrationBuilder.CreateIndex(
                name: "IX_Evaluacion_IdRubro",
                table: "Evaluacion",
                column: "IdRubro");

            migrationBuilder.CreateIndex(
                name: "IX_Entrega_GrupoTrabajoIdGrupoTrabajo",
                table: "Entrega",
                column: "GrupoTrabajoIdGrupoTrabajo");

            migrationBuilder.AddForeignKey(
                name: "FK_Archivo_Carpeta_IdCarpeta",
                table: "Archivo",
                column: "IdCarpeta",
                principalTable: "Carpeta",
                principalColumn: "IdCarpeta",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Entrega_Evaluacion_IdEvaluacion",
                table: "Entrega",
                column: "IdEvaluacion",
                principalTable: "Evaluacion",
                principalColumn: "IdEvaluacion",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Entrega_GrupoTrabajo_GrupoTrabajoIdGrupoTrabajo",
                table: "Entrega",
                column: "GrupoTrabajoIdGrupoTrabajo",
                principalTable: "GrupoTrabajo",
                principalColumn: "IdGrupoTrabajo",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Entrega_GrupoTrabajo_IdGrupoTrabajo",
                table: "Entrega",
                column: "IdGrupoTrabajo",
                principalTable: "GrupoTrabajo",
                principalColumn: "IdGrupoTrabajo");

            migrationBuilder.AddForeignKey(
                name: "FK_Evaluacion_Rubro_IdRubro",
                table: "Evaluacion",
                column: "IdRubro",
                principalTable: "Rubro",
                principalColumn: "IdRubro",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Grupo_Curso_CodigoCurso",
                table: "Grupo",
                column: "CodigoCurso",
                principalTable: "Curso",
                principalColumn: "CodigoCurso",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_GrupoTrabajo_Evaluacion_IdEvaluacion",
                table: "GrupoTrabajo",
                column: "IdEvaluacion",
                principalTable: "Evaluacion",
                principalColumn: "IdEvaluacion",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_NotaEvaluacion_Evaluacion_IdEvaluacion",
                table: "NotaEvaluacion",
                column: "IdEvaluacion",
                principalTable: "Evaluacion",
                principalColumn: "IdEvaluacion",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_NotaEvaluacion_GrupoTrabajo_IdGrupoTrabajo",
                table: "NotaEvaluacion",
                column: "IdGrupoTrabajo",
                principalTable: "GrupoTrabajo",
                principalColumn: "IdGrupoTrabajo");

            migrationBuilder.AddForeignKey(
                name: "FK_Rubro_Grupo_IdGrupo",
                table: "Rubro",
                column: "IdGrupo",
                principalTable: "Grupo",
                principalColumn: "IdGrupo",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Archivo_Carpeta_IdCarpeta",
                table: "Archivo");

            migrationBuilder.DropForeignKey(
                name: "FK_Entrega_Evaluacion_IdEvaluacion",
                table: "Entrega");

            migrationBuilder.DropForeignKey(
                name: "FK_Entrega_GrupoTrabajo_GrupoTrabajoIdGrupoTrabajo",
                table: "Entrega");

            migrationBuilder.DropForeignKey(
                name: "FK_Entrega_GrupoTrabajo_IdGrupoTrabajo",
                table: "Entrega");

            migrationBuilder.DropForeignKey(
                name: "FK_Evaluacion_Rubro_IdRubro",
                table: "Evaluacion");

            migrationBuilder.DropForeignKey(
                name: "FK_Grupo_Curso_CodigoCurso",
                table: "Grupo");

            migrationBuilder.DropForeignKey(
                name: "FK_GrupoTrabajo_Evaluacion_IdEvaluacion",
                table: "GrupoTrabajo");

            migrationBuilder.DropForeignKey(
                name: "FK_NotaEvaluacion_Evaluacion_IdEvaluacion",
                table: "NotaEvaluacion");

            migrationBuilder.DropForeignKey(
                name: "FK_NotaEvaluacion_GrupoTrabajo_IdGrupoTrabajo",
                table: "NotaEvaluacion");

            migrationBuilder.DropForeignKey(
                name: "FK_Rubro_Grupo_IdGrupo",
                table: "Rubro");

            migrationBuilder.DropIndex(
                name: "IX_Grupo_CodigoCurso",
                table: "Grupo");

            migrationBuilder.DropPrimaryKey(
                name: "PK_EstudianteGrupoTrabajo",
                table: "EstudianteGrupoTrabajo");

            migrationBuilder.DropIndex(
                name: "IX_EstudianteGrupoTrabajo_IdGrupoTrabajo",
                table: "EstudianteGrupoTrabajo");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Rubro",
                table: "Rubro");

            migrationBuilder.DropPrimaryKey(
                name: "PK_NotaEvaluacion",
                table: "NotaEvaluacion");

            migrationBuilder.DropIndex(
                name: "IX_NotaEvaluacion_IdEvaluacion",
                table: "NotaEvaluacion");

            migrationBuilder.DropIndex(
                name: "IX_NotaEvaluacion_IdGrupoTrabajo",
                table: "NotaEvaluacion");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Evaluacion",
                table: "Evaluacion");

            migrationBuilder.DropIndex(
                name: "IX_Evaluacion_IdRubro",
                table: "Evaluacion");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Entrega",
                table: "Entrega");

            migrationBuilder.DropIndex(
                name: "IX_Entrega_GrupoTrabajoIdGrupoTrabajo",
                table: "Entrega");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Archivo",
                table: "Archivo");

            migrationBuilder.DropColumn(
                name: "CarnetEstudiante",
                table: "NotaEvaluacion");

            migrationBuilder.DropColumn(
                name: "GrupoTrabajoIdGrupoTrabajo",
                table: "Entrega");

            migrationBuilder.RenameTable(
                name: "Rubro",
                newName: "Rubros");

            migrationBuilder.RenameTable(
                name: "NotaEvaluacion",
                newName: "NotaEvaluaciones");

            migrationBuilder.RenameTable(
                name: "Evaluacion",
                newName: "Evaluaciones");

            migrationBuilder.RenameTable(
                name: "Entrega",
                newName: "Entregas");

            migrationBuilder.RenameTable(
                name: "Archivo",
                newName: "Archivos");

            migrationBuilder.RenameIndex(
                name: "IX_Rubro_IdGrupo",
                table: "Rubros",
                newName: "IX_Rubros_IdGrupo");

            migrationBuilder.RenameIndex(
                name: "IX_Entrega_IdGrupoTrabajo",
                table: "Entregas",
                newName: "IX_Entregas_IdGrupoTrabajo");

            migrationBuilder.RenameIndex(
                name: "IX_Entrega_IdEvaluacion",
                table: "Entregas",
                newName: "IX_Entregas_IdEvaluacion");

            migrationBuilder.RenameColumn(
                name: "FechaPublicacion",
                table: "Archivos",
                newName: "FechaSubida");

            migrationBuilder.RenameIndex(
                name: "IX_Archivo_IdCarpeta",
                table: "Archivos",
                newName: "IX_Archivos_IdCarpeta");

            migrationBuilder.AlterColumn<string>(
                name: "Año",
                table: "Semestre",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<string>(
                name: "CodigoCurso",
                table: "Semestre",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CodigoCursoNavigation",
                table: "Semestre",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "IdSemestreNavigation",
                table: "Semestre",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SemestreNavigationIdSemestre",
                table: "Semestre",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CarnetEstudiante",
                table: "GrupoTrabajo",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CodigoCurso",
                table: "Grupo",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AddColumn<string>(
                name: "CodigoCursoNavigation",
                table: "Grupo",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "CarnetEstudiante",
                table: "EstudianteGrupoTrabajo",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "EstudianteGrupoTrabajo",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int")
                .OldAnnotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AddColumn<string>(
                name: "CarnetsEstudiantes",
                table: "EstudianteGrupo",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Id",
                table: "EstudianteGrupo",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<decimal>(
                name: "Porcentaje",
                table: "Rubros",
                type: "decimal(18,2)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<string>(
                name: "NombreRubro",
                table: "Rubros",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "RutaArchivoDetalles",
                table: "NotaEvaluaciones",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "PorcentajeObtenido",
                table: "NotaEvaluaciones",
                type: "decimal(18,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(5,2)");

            migrationBuilder.AlterColumn<string>(
                name: "Observaciones",
                table: "NotaEvaluaciones",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "IdEvaluacionNavigationIdEvaluacion",
                table: "NotaEvaluaciones",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "IdGrupoTrabajoNavigationIdGrupoTrabajo",
                table: "NotaEvaluaciones",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<decimal>(
                name: "ValorPorcentual",
                table: "Evaluaciones",
                type: "decimal(18,2)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<string>(
                name: "RutaEspecificacion",
                table: "Evaluaciones",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500);

            migrationBuilder.AlterColumn<string>(
                name: "NombreEvaluacion",
                table: "Evaluaciones",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<int>(
                name: "CantEstudiantesGrupo",
                table: "Evaluaciones",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "IdRubroNavigationIdRubro",
                table: "Evaluaciones",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<long>(
                name: "TamañoArchivo",
                table: "Archivos",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<string>(
                name: "Descripcion",
                table: "Archivos",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_EstudianteGrupoTrabajo",
                table: "EstudianteGrupoTrabajo",
                columns: new[] { "IdGrupoTrabajo", "CarnetEstudiante" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_Rubros",
                table: "Rubros",
                column: "IdRubro");

            migrationBuilder.AddPrimaryKey(
                name: "PK_NotaEvaluaciones",
                table: "NotaEvaluaciones",
                column: "IdNotaEvaluacion");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Evaluaciones",
                table: "Evaluaciones",
                column: "IdEvaluacion");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Entregas",
                table: "Entregas",
                column: "IdEntrega");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Archivos",
                table: "Archivos",
                column: "IdArchivo");

            migrationBuilder.CreateIndex(
                name: "IX_Semestre_CodigoCursoNavigation",
                table: "Semestre",
                column: "CodigoCursoNavigation");

            migrationBuilder.CreateIndex(
                name: "IX_Semestre_SemestreNavigationIdSemestre",
                table: "Semestre",
                column: "SemestreNavigationIdSemestre");

            migrationBuilder.CreateIndex(
                name: "IX_Grupo_CodigoCursoNavigation",
                table: "Grupo",
                column: "CodigoCursoNavigation");

            migrationBuilder.CreateIndex(
                name: "IX_NotaEvaluaciones_IdEvaluacionNavigationIdEvaluacion",
                table: "NotaEvaluaciones",
                column: "IdEvaluacionNavigationIdEvaluacion");

            migrationBuilder.CreateIndex(
                name: "IX_NotaEvaluaciones_IdGrupoTrabajoNavigationIdGrupoTrabajo",
                table: "NotaEvaluaciones",
                column: "IdGrupoTrabajoNavigationIdGrupoTrabajo");

            migrationBuilder.CreateIndex(
                name: "IX_Evaluaciones_IdRubroNavigationIdRubro",
                table: "Evaluaciones",
                column: "IdRubroNavigationIdRubro");

            migrationBuilder.AddForeignKey(
                name: "FK_Archivos_Carpeta_IdCarpeta",
                table: "Archivos",
                column: "IdCarpeta",
                principalTable: "Carpeta",
                principalColumn: "IdCarpeta",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Entregas_Evaluaciones_IdEvaluacion",
                table: "Entregas",
                column: "IdEvaluacion",
                principalTable: "Evaluaciones",
                principalColumn: "IdEvaluacion",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Entregas_GrupoTrabajo_IdGrupoTrabajo",
                table: "Entregas",
                column: "IdGrupoTrabajo",
                principalTable: "GrupoTrabajo",
                principalColumn: "IdGrupoTrabajo");

            migrationBuilder.AddForeignKey(
                name: "FK_Evaluaciones_Rubros_IdRubroNavigationIdRubro",
                table: "Evaluaciones",
                column: "IdRubroNavigationIdRubro",
                principalTable: "Rubros",
                principalColumn: "IdRubro",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Grupo_Curso_CodigoCursoNavigation",
                table: "Grupo",
                column: "CodigoCursoNavigation",
                principalTable: "Curso",
                principalColumn: "CodigoCurso",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_GrupoTrabajo_Evaluaciones_IdEvaluacion",
                table: "GrupoTrabajo",
                column: "IdEvaluacion",
                principalTable: "Evaluaciones",
                principalColumn: "IdEvaluacion",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_NotaEvaluaciones_Evaluaciones_IdEvaluacionNavigationIdEvaluacion",
                table: "NotaEvaluaciones",
                column: "IdEvaluacionNavigationIdEvaluacion",
                principalTable: "Evaluaciones",
                principalColumn: "IdEvaluacion",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_NotaEvaluaciones_GrupoTrabajo_IdGrupoTrabajoNavigationIdGrupoTrabajo",
                table: "NotaEvaluaciones",
                column: "IdGrupoTrabajoNavigationIdGrupoTrabajo",
                principalTable: "GrupoTrabajo",
                principalColumn: "IdGrupoTrabajo",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Rubros_Grupo_IdGrupo",
                table: "Rubros",
                column: "IdGrupo",
                principalTable: "Grupo",
                principalColumn: "IdGrupo",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Semestre_Curso_CodigoCursoNavigation",
                table: "Semestre",
                column: "CodigoCursoNavigation",
                principalTable: "Curso",
                principalColumn: "CodigoCurso",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Semestre_Semestre_SemestreNavigationIdSemestre",
                table: "Semestre",
                column: "SemestreNavigationIdSemestre",
                principalTable: "Semestre",
                principalColumn: "IdSemestre");
        }
    }
}
