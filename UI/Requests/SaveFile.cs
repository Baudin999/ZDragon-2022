using Compiler;

namespace UI.Requests;

public static class SaveFile
{
    public class SaveFileRequest : IHttpRequest
    {
        public string Text { get; set; } = default!;
        public string Path { get; set; } = default!;
        
        private string _basePath = default!;
        public string BasePath
        {
            get { return _basePath; }
            set { _basePath = FileHelpers.SystemBasePath(value); }
        }
    }


    public class Handler : IHttpHandler<SaveFileRequest>
    {
        public async Task<IResult> Handle(SaveFileRequest saveFileRequest, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(saveFileRequest.BasePath))
            {
                throw new Exception("Invalid message");
            }
        
        
            var module = new FileModule(saveFileRequest.BasePath, saveFileRequest.Path, saveFileRequest.Text);
            await module.SaveText();
            var resolver = new FileResolver(saveFileRequest.BasePath);
            var zdragon = await new ZDragon(saveFileRequest.BasePath, resolver).Compile(module);

            await zdragon.SaveNodes();
            await zdragon.SaveReferences();
            await zdragon.ComponentDiagram();
            await zdragon.MainPage();

            return Results.Ok(zdragon.Errors);
        }
    }
}