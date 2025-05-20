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
            modelBuilder.Entity<Grupo>().ToTable("Grupo");
            modelBuilder.Entity<Carpeta>().ToTable("Carpeta");
            modelBuilder.Entity<Noticia>().ToTable("Noticia");
            modelBuilder.Entity<Archivo>().ToTable("Archivo");
            modelBuilder.Entity<Rubro>().ToTable("Rubro");
            modelBuilder.Entity<Evaluacion>().ToTable("Evaluacion");
            modelBuilder.Entity<GrupoTrabajo>().ToTable("GrupoTrabajo");

            modelBuilder.Entity<ProfesorGrupo>()
                .ToTable("ProfesorGrupo")
                .HasKey(pg => new { pg.IdGrupo, pg.CedulaProfesor });

            modelBuilder.Entity<ProfesorGrupo>()
                .HasOne(pg => pg.Grupo)
                .WithMany()
                .HasForeignKey(pg => pg.IdGrupo);
            
            modelBuilder.Entity<EstudianteGrupo>()
                .ToTable("EstudianteGrupo") 
                .HasKey(eg => new { eg.IdGrupo, eg.CarnetEstudiante });

            modelBuilder.Entity<EstudianteGrupo>()
                .HasOne(eg => eg.Grupo)
                .WithMany(g => g.Estudiantes)  
                .HasForeignKey(eg => eg.IdGrupo);

            modelBuilder.Entity<GrupoTrabajo>()
                .HasKey(gt => new { gt.CarnetEstudiante, gt.IdGrupoTrabajo, gt.IdEvaluacion });


            base.OnModelCreating(modelBuilder); 
        }   
        public DbSet<Semestre> Semestres { get; set; }
        public DbSet<Curso> Cursos { get; set; }
        public DbSet<Grupo> Grupos { get; set; }
        public DbSet<ProfesorGrupo> ProfesorGrupos { get; set; }
        public DbSet<EstudianteGrupo> EstudianteGrupos { get; set; }
        public DbSet<Carpeta> Carpetas { get; set; }
        public DbSet<Noticia> Noticias { get; set; }
        public DbSet<Archivo> Archivos { get; set; }
        public DbSet<Rubro> Rubros { get; set; }
        public DbSet<Evaluacion> Evaluaciones { get; set; }
        public DbSet<GrupoTrabajo> GrupoTrabajos { get; set; }
        /*public DbSet<Entrega> Entregas { get; set; }
        public DbSet<NotaEvaluacion> NotaEvaluaciones { get; set; }*/
    }
}
