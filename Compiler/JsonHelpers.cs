namespace Compiler;

public static class JsonHelpers
{
    public static readonly JsonSerializerSettings JsonSerializationSettings = new JsonSerializerSettings
    {
        TypeNameHandling = TypeNameHandling.Objects,
        MetadataPropertyHandling = MetadataPropertyHandling.ReadAhead,
        Formatting = Formatting.Indented,
        ReferenceLoopHandling = ReferenceLoopHandling.Ignore,
        Converters = new List<Newtonsoft.Json.JsonConverter>
        {
            new Newtonsoft.Json.Converters.StringEnumConverter()
        }
    };

    public static string Serialize<T>(T o)
    {
        return JsonConvert.SerializeObject(o, JsonSerializationSettings);
    }

    public static T Deserialize<T>(string s)
    {
        return JsonConvert.DeserializeObject<T>(s);
    }
}