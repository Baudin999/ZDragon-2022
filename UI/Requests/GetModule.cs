namespace UI.Requests;


/// <summary>
/// Get's the .car file information and content.
/// </summary>
public class GetModule
{
    public class GetModuleRequest : IHttpRequest
    {
        public string Path { get; set; } = default!;
        private string _basePath = default!;
        public string BasePath
        {
            get { return _basePath; }
            set { _basePath = FileHelpers.SystemBasePath(value); }
        }
    }

    public class Handler : IHttpHandler<GetModule.GetModuleRequest>
    {
        public async Task<IResult> Handle(GetModuleRequest getModuleRequest, CancellationToken cancellationToken)
        {
            // return content of the file if it exists
            if (System.IO.File.Exists(getModuleRequest.Path))
            {
                var @namespace = FileHelpers.GetNamespaceFromFileName(getModuleRequest.BasePath, getModuleRequest.Path);
                var text = await System.IO.File.ReadAllTextAsync(getModuleRequest.Path);
                return Results.Ok(new
                {
                    text,
                    Namespace = @namespace
                });
            }

            return Results.Ok("");
        }
    }
}