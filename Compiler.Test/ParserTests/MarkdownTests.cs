namespace Compiler.Test.ParserTests;

public class MarkdownTests
{
    [Fact(DisplayName = "Multiple Indentations")]
    public async void MultipleIndentations()
    {
        const string code = @"
* First
    * Sub
    * Sub 2
";
        var zdragon = await new ZDragon().Compile(code);
        Assert.Single(zdragon.Nodes);
    }
}