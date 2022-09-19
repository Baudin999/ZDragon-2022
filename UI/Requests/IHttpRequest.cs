
namespace UI.Requests;

public interface IHttpRequest : IRequest<IResult>
{
    
}

public interface IHttpHandler<in T> : IRequestHandler<T, IResult> where T : IHttpRequest
{
    
} 