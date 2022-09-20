namespace UI.Requests;

public static class GetRelations
{
    public class Request : IHttpRequest
    {
        private string _basePath = default!;
        public string BasePath
        {
            get { return _basePath; }
            set { _basePath = FileHelpers.SystemBasePath(value); }
        }
        public string Type { get; set; } = default!;
    }

    public class Handler : IHttpHandler<Request>
    {
        public Task<IResult> Handle(Request request, CancellationToken cancellationToken)
        {
            // do things
            return Task.FromResult(Results.Ok(new 
            {
                message = "success"
            }));
        }
    }
}