namespace UI.Requests;

public class HoiJasper
{
    public class HoiJasperRequest : IHttpRequest
    {
        
    }

    public class Handler : IRequestHandler<HoiJasperRequest, IResult>
    {
        public async Task<IResult> Handle(HoiJasperRequest createFileRequest, CancellationToken cancellationToken)
        {
            return Results.Ok(new
                {
                    Message = "Hoi Jasper"
                });

        }
    }
}