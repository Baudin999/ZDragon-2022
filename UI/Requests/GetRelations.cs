using Compiler;
using Compiler.Parsers;
using UI.Services;

namespace UI.Requests;

public static class GetRelations
{
    

    
    
    public class GetRelationsRequest : IHttpRequest
    {
        private string _basePath = default!;
        public string BasePath
        {
            get { return _basePath; }
            set { _basePath = FileHelpers.SystemBasePath(value); }
        }
        public string Type { get; set; } = default!;
    }

    public class Handler : IHttpHandler<GetRelationsRequest>
    {
        private readonly RelationsService _relationsService;
        public Handler(RelationsService relationsService)
        {
            this._relationsService = relationsService;
        }
        
        public async Task<IResult> Handle(GetRelationsRequest getRelationsRequest, CancellationToken cancellationToken)
        {
            if (_relationsService.Relations is null)
                await _relationsService.GetRelations(getRelationsRequest.BasePath);

            return Results.Ok(_relationsService.Relations);
        }
    }

}