using Compiler;
using Microsoft.AspNetCore.StaticFiles;

namespace UI.Controllers;

[ApiController]
public class FileController : ControllerBase
{
    [HttpPut("/file")]
    public async Task<List<Error>> SaveFile(SaveFileBody saveFileBody)
    {
        if (string.IsNullOrWhiteSpace(saveFileBody.Root))
        {
            throw new Exception("Invalid message");
        }
        
        
        var module = new FileModule(saveFileBody.Root, saveFileBody.Path, saveFileBody.Text);
        await module.SaveText();
        var resolver = new FileResolver(saveFileBody.Root);
        var zdragon = await new ZDragon(saveFileBody.Root, resolver).Compile(module);
        await zdragon.ComponentDiagram();
        await zdragon.MainPage();

        return zdragon.Errors;
    }
    
    
    [HttpGet("/project-file/{basePath}/{currentPath}/{fileName}")]
    public async Task<ActionResult> GetIndexPage(string basePath, string currentPath, string fileName)
    {
        var @namespace = FileHelpers.GenerateNamespaceFromFileName(basePath, currentPath);
        var path = Path.Combine(basePath, ".out", @namespace, fileName);
        var bytes = await FileHelpers.ReadBytesAsync(path);
        new FileExtensionContentTypeProvider().TryGetContentType(fileName, out string? contentType);

        
        if (bytes is not null)
        {
            return File(bytes, contentType ?? "application/octet-stream");
        }
        else
        {
            return NotFound();
        }

    }

    


    public class SaveFileBody
    {
        public string Text { get; set; } = default!;
        public string Path { get; set; } = default!;
        public string Root { get; set; } = default!;
    }
}