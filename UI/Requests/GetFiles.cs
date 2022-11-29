using System.Web;
using UI.Services;

namespace UI.Requests;


/// <summary>
/// Get the files from a base_dir. These files are the modules
/// of the ZDragon project.
/// </summary>

public class GetFiles
{
    public class GetFilesRequest : IHttpRequest
    {
        private string _basePath = default!;
        public string BasePath
        {
            get { return _basePath; }
            set { _basePath = FileHelpers.SystemBasePath(value); }
        }
    }


    public class Handler : IRequestHandler<GetFilesRequest, IResult>
    {
        public Task<IResult> Handle(GetFilesRequest getFilesRequest, CancellationToken cancellationToken)
        {
            var result = new FileSystemService().GetFileSystemObjects(getFilesRequest.BasePath);
            return Task.FromResult<IResult>(Results.Ok(result));
        }
    }
}