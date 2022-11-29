using System.Text.Json.Serialization;
using UI;
using UI.Requests;
using UI.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder
    .Services
    .AddMediatR(x => x.AsScoped(), typeof(Program));

builder
    .Services
    .AddControllers()
    .AddJsonOptions(opts =>
        {
            var enumConverter = new JsonStringEnumConverter();
            opts.JsonSerializerOptions.Converters.Add(enumConverter);
        });

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// add injection services
builder.Services.AddSingleton<SessionParameters>();

var app = builder.Build();



app.Use(async (context, next) => {
    var url = context.Request.Path.Value;
    var allowedPaths = new List<string> {
        "/editor", "/lexicon", "/about"
    };
    // Rewrite to index
    if (allowedPaths.Contains(url ?? "")) {
        // rewrite and continue processing
        context.Request.Path = "/";
    }

    await next();
});

// register endpoints

app
    .MediateGet<GetFiles.GetFilesRequest>("/project/files/{basePath}")
    .MediateGet<GetRelations.GetRelationsRequest>("/relations/{basePath}/{type}")
    .MediatePut<SaveFile.SaveFileRequest>("/file")
    // module endpoints 
    .MediatePut<CreateFile.CreateFileRequest>("/module")
    .MediateDelete<DeleteModule.DeleteModuleRequest>("/module")
    .MediatePut<GetModule.GetModuleRequest>("/page")
    .MediateGet<GetProjectFile.GetProjectFileRequest>("/project-file/{basePath}/{currentPath}/{fileName}");


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.UseDefaultFiles();
app.UseStaticFiles();

app.Run();



