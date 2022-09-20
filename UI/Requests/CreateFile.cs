using UI.Services;

namespace UI.Requests;
public static class CreateFile
{
    public class Request : IHttpRequest
    {
        public string Namespace { get; set; } = default!;

        private string _basePath = default!;
        public string BasePath
        {
            get { return _basePath; }
            set { _basePath = FileHelpers.SystemBasePath(value); }
        }
    }

    public class Handler : IRequestHandler<Request, IResult>
    {
        public async Task<IResult> Handle(Request request, CancellationToken cancellationToken)
        {
            
            var fileName = FileHelpers.GetCarFileFromNamespaceAndBasePath(request.BasePath, request.Namespace);
            var directory = Path.GetDirectoryName(fileName);
            
            // directory is not allowed to be null
            if (directory is null) return Results.NotFound();
            
            if (!Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
            }

            if (!File.Exists(fileName))
            {
                await FileHelpers.SaveFileAsync(fileName, "# Welcome");
            }
            
            return Results.Ok(new
            {
                message = $"You asked for: {request.Namespace}",
                ns = request.Namespace,
                basePath = request.BasePath,
                fullName = fileName,
                files =  new FileSystemService().GetFileSystemObjects(request.BasePath)
            });
        }
    }
}
