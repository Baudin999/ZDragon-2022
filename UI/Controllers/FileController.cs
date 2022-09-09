using Compiler;

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

    


    public class SaveFileBody
    {
        public string Text { get; set; } = default!;
        public string Path { get; set; } = default!;
        public string Root { get; set; } = default!;
    }
}