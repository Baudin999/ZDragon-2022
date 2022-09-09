namespace Compiler;

public class TranspilationService
{
    internal static async Task<byte[]> ToSvg(string puml)
    {
        var renderUrl = "http://localhost:8080/svg";
        try
        {
            using (HttpClient httpClient = new HttpClient())
            {

                var newPuml = $@"@startuml
{puml}
@enduml
";
                var content = new StringContent(newPuml, Encoding.UTF8, "text/plain");
                var result = await httpClient.PostAsync(renderUrl, content);

                if (result.IsSuccessStatusCode)
                {
                    return await result.Content.ReadAsByteArrayAsync().ConfigureAwait(false);
                }
                else
                {
                    Console.WriteLine("Failed to generate PlantUML: " + result.StatusCode);
                }

                throw new HttpRequestException(result.ReasonPhrase);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
        }

        return new byte[0];
    }
}