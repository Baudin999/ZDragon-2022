namespace Compiler.Test.ParserTests;

public class DirectiveTests
{
    [Fact(DisplayName = "001 - Simple directive")]
    public async void TestDirective()
    {
        const string code = @"% data: false";
        var zdragon = await new ZDragon().Compile(code);

        Assert.Single(zdragon.Nodes);
        Assert.IsType<DirectiveNode>(zdragon.Nodes[0]);
        Assert.Equal("data", ((DirectiveNode)zdragon.Nodes[0]).Key);
        Assert.Equal("false", ((DirectiveNode)zdragon.Nodes[0]).Value);
        
    }
    
    [Fact(DisplayName = "002 - Multiple directives")]
    public async void MultipleDirectives()
    {
        const string code = @"
% data: false
% components: true
% tables: false
component Foo
component Bar";
        var zdragon = await new ZDragon().Compile(code);

        Assert.Equal(5, zdragon.Nodes.Count);
        Assert.IsType<DirectiveNode>(zdragon.Nodes[0]);
        Assert.Equal("data", ((DirectiveNode)zdragon.Nodes[0]).Key);
        Assert.Equal("false", ((DirectiveNode)zdragon.Nodes[0]).Value);
        
        Assert.IsType<DirectiveNode>(zdragon.Nodes[1]);
        Assert.Equal("components", ((DirectiveNode)zdragon.Nodes[1]).Key);
        Assert.Equal("true", ((DirectiveNode)zdragon.Nodes[1]).Value);
        
        Assert.IsType<DirectiveNode>(zdragon.Nodes[2]);
        Assert.Equal("tables", ((DirectiveNode)zdragon.Nodes[2]).Key);
        Assert.Equal("false", ((DirectiveNode)zdragon.Nodes[2]).Value);
        
        Assert.IsType<ComponentNode>(zdragon.Nodes[3]);
        Assert.Equal("Foo", ((ComponentNode)zdragon.Nodes[3]).Id);
        
        
    }
}