using Compiler;

namespace UI.Controllers;

[ApiController]
public class FileController : ControllerBase
{
    [HttpPut("/file")]
    public async Task<List<Error>> SaveFile(SaveFileBody saveFileBody)
    {
        await FileHelpers.SaveFileAsync(saveFileBody.Path, saveFileBody.Text);
        var resolver = new FileResolver(Path.GetDirectoryName(saveFileBody.Path) ?? throw new Exception("Invalid directory"));
        var zdragon = await new ZDragon().Compile(saveFileBody.Text);

        return zdragon.Errors;
    }


    public class SaveFileBody
    {
        public string Text { get; set; } = default!;
        public string Path { get; set; } = default!;
    }
}