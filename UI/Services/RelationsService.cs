using Compiler.Parsers;

namespace UI.Services;

public class RelationsService
{
    public Dictionary<string, List<NodeReference>>? Relations { get; set; }
        
    public void Clear()
    {
        Relations = null;
    }
        
    public async Task<Dictionary<string, List<NodeReference>>> GetRelations(string basePath)
    {
        var references = new Dictionary<string, List<NodeReference>>();
        var binFolder = FileHelpers.GetBinPathFromBasePath(basePath);

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
            
        Relations = references;

        return references;
    }
}