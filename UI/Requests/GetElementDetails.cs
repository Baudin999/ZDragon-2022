using Compiler.Parsers;
using Compiler.Parsers.Nodes;
using Microsoft.AspNetCore.Http.HttpResults;
using UI.Services;

namespace UI.Requests;

public class GetElementDetails
{
    public class GetElementDetailsRequest : IHttpRequest
    {
        public string Namespace { get; set; } = default!;
        public string Name { get; set; } = default!;
        private string _basePath = default!;
        public string BasePath
        {
            get { return _basePath; }
            set { _basePath = FileHelpers.SystemBasePath(value); }
        }
    }

    public class Handler : IRequestHandler<GetElementDetailsRequest, IResult>
    {
        
        private readonly RelationsService _relationsService;
        public Handler(RelationsService relationsService)
        {
            this._relationsService = relationsService;
        }
        
        public async Task<IResult> Handle(GetElementDetailsRequest getFilesRequest, CancellationToken cancellationToken)
        {
            if (_relationsService.Relations is null)
                await _relationsService.GetRelations(getFilesRequest.BasePath);
            
            if (_relationsService.Relations is null)
                return Results.Problem("Relations not found");

            var elements = _relationsService.Relations[getFilesRequest.Namespace];
            var element = elements.FirstOrDefault(x => x.From == getFilesRequest.Name && x.ReferenceType == ReferenceType.DefinedIn);
            
            if (element is null) return Results.Problem("Element does not exist");
            
            var binFolder = FileHelpers.GetBinPathFromBasePath(getFilesRequest.BasePath);
            var nodesFileName = Path.Combine(binFolder, getFilesRequest.Namespace + ".nodes.json");
            var nodes = await FileHelpers.ReadObjectAsync<List<AstNode>>(nodesFileName) ?? new List<AstNode>();
            
            var identifiers = nodes
                .OfType<IIdentifier>()
                .ToList();
                
            var node = identifiers.FirstOrDefault(x => x.Id == element.From);

            var hydratedNode = node?.Hydrate() ?? "No hydration information";
            
            return node is null ? Results.NotFound("Node not found") : Results.Ok(new
            {
                AstNode = node,
                HydratedNode = hydratedNode,
                Element = element,
                getFilesRequest.Namespace
            });
        }
    }
}