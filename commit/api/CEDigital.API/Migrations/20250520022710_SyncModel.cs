using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CEDigital.API.Migrations
{
    /// <inheritdoc />
    public partial class SyncModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Grupo_Curso_CodigoCursoNavigation",
                table: "Grupo");

            migrationBuilder.DropIndex(
                name: "IX_Grupo_CodigoCursoNavigation",
                table: "Grupo");

            migrationBuilder.DropColumn(
                name: "CodigoCursoNavigation",
                table: "Grupo");

            migrationBuilder.DropColumn(
                name: "CarnetsEstudiantes",
                table: "EstudianteGrupo");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "EstudianteGrupo");

            migrationBuilder.AlterColumn<string>(
                name: "CodigoCurso",
                table: "Grupo",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.CreateIndex(
                name: "IX_Grupo_CodigoCurso",
                table: "Grupo",
                column: "CodigoCurso");

            migrationBuilder.AddForeignKey(
                name: "FK_Grupo_Curso_CodigoCurso",
                table: "Grupo",
                column: "CodigoCurso",
                principalTable: "Curso",
                principalColumn: "CodigoCurso",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Grupo_Curso_CodigoCurso",
                table: "Grupo");

            migrationBuilder.DropIndex(
                name: "IX_Grupo_CodigoCurso",
                table: "Grupo");

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

            migrationBuilder.CreateIndex(
                name: "IX_Grupo_CodigoCursoNavigation",
                table: "Grupo",
                column: "CodigoCursoNavigation");

            migrationBuilder.AddForeignKey(
                name: "FK_Grupo_Curso_CodigoCursoNavigation",
                table: "Grupo",
                column: "CodigoCursoNavigation",
                principalTable: "Curso",
                principalColumn: "CodigoCurso",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
