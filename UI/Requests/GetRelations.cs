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
            var references = new Dictionary<string, List<NodeReference>>();
            var binFolder = FileHelpers.GetBinPathFromBasePath(getRelationsRequest.BasePath);

            foreach (var fileName in Directory.GetFiles(binFolder).Where(f => f.EndsWith("refs.json")))
            {
                // remove .refs.json from the end of the file name
                var @namespace = fileName.Replace(".refs.json", "").Replace(binFolder, "").Replace("\\", "");
                var result = await FileHelpers.ReadObjectAsync<List<NodeReference>>(fileName);
                if (result is not null && result.Count > 0)
                {
                    references.Add(@namespace, result);
                }
            }

            return Results.Ok(references);
            
        }
    }
}