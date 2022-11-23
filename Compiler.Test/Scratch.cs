namespace Compiler.Test;

public class Scratch
{
    [Fact]
    public async void TestStickyComponents()
    {
        const string code = @"
component Foo
component Bar
";
        var zdragon = await new ZDragon().Compile(code);
        Assert.Equal(2, zdragon.Nodes.Count);
        Assert.IsType<ComponentNode>(zdragon.Nodes[0]);
        Assert.Equal("Foo", (zdragon.Nodes[0] as ComponentNode)?.Id);
        Assert.IsType<ComponentNode>(zdragon.Nodes[1]);
        Assert.Equal("Bar", (zdragon.Nodes[1] as ComponentNode)?.Id);
    }
}