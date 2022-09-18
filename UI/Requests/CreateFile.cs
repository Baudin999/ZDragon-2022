namespace UI.Requests;
public static class CreateFile
{
    public class Request : IHttpRequest
    {
        public string Namespace { get; set; } = default!;
        public string BasePath { get; set; } = default!;
    }

    public class Handler : IRequestHandler<Request, IResult>
    {
        public Task<IResult> Handle(Request request, CancellationToken cancellationToken)
        {
            return Task.FromResult(Results.Ok(new
            {
                message = $"You asked for: {request.Namespace}"
            }));
        }
    }
}
