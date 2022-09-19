namespace UI.Requests;


/// <summary>
/// Get's the .car file information and content.
/// </summary>
public class GetModule
{
    public class Request : IHttpRequest
    {
        public string Path { get; set; }
        public string BasePath { get; set; }
    }

    public class Handler : IHttpHandler<GetModule.Request>
    {
        public async Task<IResult> Handle(Request request, CancellationToken cancellationToken)
        {
            // return content of the file if it exists
            if (System.IO.File.Exists(request.Path))
            {
                var @namespace = FileHelpers.GenerateNamespaceFromFileName(request.BasePath, request.Path);
                var text = await System.IO.File.ReadAllTextAsync(request.Path);
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