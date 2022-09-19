namespace UI.Requests;

public static class GetRelations
{
    public class Request : IHttpRequest
    {
        public string BaseDir { get; set; } = default!;
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