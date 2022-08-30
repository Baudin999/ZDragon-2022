using Newtonsoft.Json;

namespace Compiler.Resolvers;

public static class FileHelpers
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

    public static async Task<string?> ReadFileAsync(string path)
    {
        if (File.Exists(path))
        {
            // create a read stream and read all the text
            // close the stream afterawrds
            using var stream = File.OpenText(path);
            var result = await stream.ReadToEndAsync();
            stream.Close();
            stream.Dispose();
            return result;
        }
        else
        {
            return null;
        }
    }

    public static async Task<byte[]?> ReadBytesAsync(string path)
    {
        if (File.Exists(path))
        {
            return await File.ReadAllBytesAsync(path);
        }
        else
        {
            return null;
        }
    }

    public static async Task<T?> ReadObjectAsync<T>(string path)
    {
        if (File.Exists(path))
        {
            var json = await File.ReadAllTextAsync(path);
            return JsonConvert.DeserializeObject<T>(json, JsonSerializationSettings);
        }
        else
        {
            return default(T);
        }
    }

    public static async Task SaveFileAsync(string path, string content)
    {
        var directory = Path.GetDirectoryName(path);
        if (directory is not null && !Directory.Exists(directory))
        {
            Directory.CreateDirectory(directory);
        }

        await File.WriteAllTextAsync(path, content);
    }

    public static async Task SaveFileAsync(string path, byte[] content)
    {
        var directory = Path.GetDirectoryName(path);
        if (directory is not null && !Directory.Exists(directory))
        {
            Directory.CreateDirectory(directory);
        }

        await File.WriteAllBytesAsync(path, content);
    }

    public static async Task SaveObjectAsync<T>(string path, T o)
    {
        var directory = Path.GetDirectoryName(path);
        if (directory is not null && !Directory.Exists(directory))
        {
            Directory.CreateDirectory(directory);
        }

        try
        {
            var json = JsonConvert.SerializeObject(o, JsonSerializationSettings);
            await File.WriteAllTextAsync(path, json);
        }
        catch (System.Exception ex)
        {
            System.Console.WriteLine("Failed to serialize: " + o?.GetType().FullName ?? "UNKNOWN");
            System.Console.WriteLine(ex.Message);
        }
    }
}