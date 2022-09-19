using Compiler;

namespace UI.Requests;

public static class SaveFile
{
    public class SaveFileRequest : IHttpRequest
    {
        public string Text { get; set; } = default!;
        public string Path { get; set; } = default!;
        public string Root { get; set; } = default!;
    }


    public class Handler : IHttpHandler<SaveFileRequest>
    {
        public async Task<IResult> Handle(SaveFileRequest saveFileRequest, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(saveFileRequest.Root))
            {
                throw new Exception("Invalid message");
            }
        
        
            var module = new FileModule(saveFileRequest.Root, saveFileRequest.Path, saveFileRequest.Text);
            await module.SaveText();
            var resolver = new FileResolver(saveFileRequest.Root);
            var zdragon = await new ZDragon(saveFileRequest.Root, resolver).Compile(module);

            await zdragon.SaveNodes();
            await zdragon.SaveReferences();
            await zdragon.ComponentDiagram();
            await zdragon.MainPage();

            return Results.Ok(zdragon.Errors);
        }
    }
}