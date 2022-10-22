namespace Compiler.Test;

public class Scratch
{
    [Fact]
    public async void TestStickyComponents()
    {
        const string code = @"
component Foo
";
        var zdragon = await new ZDragon().Compile(code);
        // Assert.Equal(2, zdragon.Nodes.Count);
        Assert.IsType<ComponentNode>(zdragon.Nodes[0]);
        // Assert.IsType<ComponentNode>(zdragon.Nodes[1]);
    }
}