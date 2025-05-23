using Microsoft.AspNetCore.Mvc;
using CEDigital.API.Models;
using CEDigital.API.Services;
using MongoDB.Driver;

namespace CEDigital.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IMongoCollection<Estudiante> _estudiantes;
        private readonly IMongoCollection<Profesor> _profesores;
        private readonly IMongoCollection<Administrador> _administradores;

        public AuthController(MongoDBService mongoDbService)
        {
            _estudiantes = mongoDbService.GetCollection<Estudiante>("Estudiantes");
            _profesores = mongoDbService.GetCollection<Profesor>("Profesores");
            _administradores = mongoDbService.GetCollection<Administrador>("Administradores");
        }

        public class LoginRequest
        {
            public string Correo { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        public class LoginResponse
        {
            public string Id { get; set; }
            public string Nombre { get; set; }
            public string Tipo { get; set; } // estudiante, profesor, administrador
            public string? Carnet { get; set; }
        }

        [HttpPost("Login")]
        public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
        {
            var passwordHash = PasswordHelper.ToMD5(request.Password);
            var correo = request.Correo.ToLower();

            if (correo.EndsWith("@estudiance.cr"))
            {
                var estudiante = await _estudiantes.Find(e => e.Correo == correo && e.Password == passwordHash).FirstOrDefaultAsync();
                if (estudiante != null)
                {
                    return new LoginResponse { Id = estudiante.Id!, Nombre = estudiante.Nombre!, Tipo = "estudiante", Carnet = estudiante.Carnet };
                }
            }
            else if (correo.EndsWith("@cecr.ac.cr"))
            {
                var profesor = await _profesores.Find(p => p.Correo == correo && p.Password == passwordHash).FirstOrDefaultAsync();
                if (profesor != null)
                {
                    return new LoginResponse { Id = profesor.Id!, Nombre = profesor.Nombre!, Tipo = "profesor" };
                }
            }
            else if (correo.EndsWith("@admince.ac.cr"))
            {
                var admin = await _administradores.Find(a => a.Correo == correo && a.Password == passwordHash).FirstOrDefaultAsync();
                if (admin != null)
                {
                    return new LoginResponse { Id = admin.Id!, Nombre = admin.Nombre!, Tipo = "administrador" };
                }
            }
            else
            {
                return Unauthorized("Dominio de correo no válido para el sistema");
            }

            return Unauthorized("Usuario o contraseña incorrectos");
        }
    }
} 