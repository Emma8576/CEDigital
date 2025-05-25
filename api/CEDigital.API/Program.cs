using CEDigital.API.Configuration;
using CEDigital.API.Services;
using Microsoft.OpenApi.Models;
using Microsoft.EntityFrameworkCore;
using CEDigital.API.Data;

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    WebRootPath = "wwwroot"
});

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddEndpointsApiExplorer();

// Configure MongoDB
var mongoDbSettings = builder.Configuration.GetSection("MongoDbSettings").Get<MongoDbSettings>();
builder.Services.Configure<MongoDbSettings>(builder.Configuration.GetSection("MongoDbSettings"));
builder.Services.AddSingleton<MongoDBService>();
builder.Services.AddSingleton<ProfesorMongoService>();
builder.Services.AddSingleton<EstudianteMongoService>();

// Configure Swagger
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "CEDigital API", Version = "v1" });
});

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Configure SQL Server
builder.Services.AddDbContext<CEDigitalContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("SQLConnection")));

var app = builder.Build();

// Enable Swagger
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "CEDigital API V1");
    c.RoutePrefix = "swagger";
});

// app.UseHttpsRedirection(); // Commented out to allow HTTP requests
app.UseStaticFiles();

// Configure CORS
app.UseCors();

app.UseAuthorization();
app.MapControllers();

app.Run();
