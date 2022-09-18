using UI.Requests;

namespace UI;

public static class MediatrExtensions
{
    public static WebApplication MediateGet<TRequest>(
        this WebApplication app,
        string template) where TRequest : IHttpRequest
    {
        app.MapGet(template,
            async (IMediator mediator, [AsParameters] TRequest request) => await mediator.Send(request));
        return app;
    }
    
    public static WebApplication MediatePut<TRequest>(
        this WebApplication app,
        string template) where TRequest : IHttpRequest
    {
        app.MapPut(template,
            async (IMediator mediator, [FromBody] TRequest request) => {
                return await mediator.Send(request);
            });
        return app;
    }
}