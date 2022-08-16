namespace Compiler.Test.ParserTests;

public class FunctionDefinition
{
    [Fact]
    public void ComplexTypeDefinition()
    {
        const string code = @"
type Add = int -> int -> int
let Add x y =
    x + y
";

        var zdragon = new ZDragon().Compile(code);

        Assert.NotNull(zdragon.Nodes);
        Assert.NotEmpty(zdragon.Nodes);
        Assert.Empty(zdragon.Errors);

        
    }
}