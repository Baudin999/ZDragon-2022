using UI.Services;

namespace UI.Requests;
public static class CreateFile
{
    public class CreateFileRequest : IHttpRequest
    {
        public string Namespace { get; set; } = default!;

        private string _basePath = default!;
        public string BasePath
        {
            get { return _basePath; }
            set { _basePath = FileHelpers.SystemBasePath(value); }
        }
    }

    public class Handler : IRequestHandler<CreateFileRequest, IResult>
    {
        public async Task<IResult> Handle(CreateFileRequest createFileRequest, CancellationToken cancellationToken)
        {
            
            var fileName = FileHelpers.GetCarFileFromNamespaceAndBasePath(createFileRequest.BasePath, createFileRequest.Namespace);
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
                message = $"You asked for: {createFileRequest.Namespace}",
                ns = createFileRequest.Namespace,
                basePath = createFileRequest.BasePath,
                fullName = fileName,
                files =  new FileSystemService().GetFileSystemObjects(createFileRequest.BasePath)
            });
        }
    }
}
