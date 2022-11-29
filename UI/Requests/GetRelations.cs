using Compiler;
using Compiler.Parsers;

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
        public async Task<IResult> Handle(GetRelationsRequest getRelationsRequest, CancellationToken cancellationToken)
        {
            var references = new List<NodeReference>();
            var binFolder = FileHelpers.GetBinPathFromBasePath(getRelationsRequest.BasePath);
            foreach (var fileName in Directory.GetFiles(binFolder).Where(f => f.EndsWith("refs.json")))
            {
                var result = await FileHelpers.ReadObjectAsync<List<NodeReference>>(fileName);
                if (result is not null)
                    references.AddRange(result);
            }

            return Results.Ok(references);
            
        }
    }
}