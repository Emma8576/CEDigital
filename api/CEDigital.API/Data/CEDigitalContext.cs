using Microsoft.EntityFrameworkCore;
using CEDigital.API.Models;

namespace CEDigital.API.Data
{
    public class CEDigitalContext : DbContext
    {
        public CEDigitalContext(DbContextOptions<CEDigitalContext> options) : base(options) { }

        public DbSet<Carrera> Carreras { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Carrera>().ToTable("Carrera"); 
            modelBuilder.Entity<Semestre>().ToTable("Semestre");
            modelBuilder.Entity<Curso>().ToTable("Curso");
            base.OnModelCreating(modelBuilder); 
        }   

        public DbSet<Semestre> Semestres { get; set; }
        public DbSet<Curso> Cursos { get; set; }
        /*public DbSet<Grupo> Grupos { get; set; }
        public DbSet<ProfesorGrupo> ProfesorGrupos { get; set; }
        public DbSet<EstudianteGrupo> EstudianteGrupos { get; set; }
        public DbSet<Carpeta> Carpetas { get; set; }
        public DbSet<Archivo> Archivos { get; set; }
        public DbSet<Noticia> Noticias { get; set; }
        public DbSet<Rubro> Rubros { get; set; }
        public DbSet<Evaluacion> Evaluaciones { get; set; }
        public DbSet<GrupoTrabajo> GrupoTrabajos { get; set; }
        public DbSet<Entrega> Entregas { get; set; }
        public DbSet<NotaEvaluacion> NotaEvaluaciones { get; set; }*/
    }
}
