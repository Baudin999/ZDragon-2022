namespace Compiler.Test.ParserTests;

public class EnumTests
{
    [Fact(DisplayName = "Create simple string enum")]
    public async void CreateSimpleStringEnum()
    {
        const string code = @"
enum MyEnum =
    | ""A""
    | ""B""
    | ""C""
";
        var zdragon = await new ZDragon().Compile(code);
        Assert.Single(zdragon.Nodes);

        Assert.IsType<EnumNode>(zdragon.Nodes[0]);
        var enumNode = (EnumNode)zdragon.Nodes[0];
        Assert.Equal("MyEnum", enumNode.Id);
        Assert.Equal(3, enumNode.Fields.Count);
        Assert.Equal("A", enumNode.Fields[0].Value);
        Assert.Equal("B", enumNode.Fields[1].Value);
        Assert.Equal("C", enumNode.Fields[2].Value);
    }
    
    [Fact(DisplayName = "Create annotated string enum")]
    public async void CreateAnnotatedEnum()
    {
        const string code = @"
@ This is a test enum
@ This is a second annotation
enum MyEnum =
    @ The first value A
    | ""A""
    @ The second value B
    | ""B""
    @ The third value C
    @ With a longer annotation
    | ""C""
";
        var zdragon = await new ZDragon().Compile(code);
        Assert.Single(zdragon.Nodes);

        Assert.IsType<EnumNode>(zdragon.Nodes[0]);
        var enumNode = (EnumNode)zdragon.Nodes[0];
        Assert.Equal("MyEnum", enumNode.Id);
        Assert.Equal(@"This is a test enum
This is a second annotation", enumNode.Description);
        Assert.Equal(3, enumNode.Fields.Count);
        Assert.Equal("A", enumNode.Fields[0].Value);
        Assert.Equal(@"The first value A", enumNode.Fields[0].Description);
        Assert.Equal("B", enumNode.Fields[1].Value);
        Assert.Equal(@"The second value B", enumNode.Fields[1].Description);
        Assert.Equal("C", enumNode.Fields[2].Value);
        Assert.Equal(@"The third value C
With a longer annotation", enumNode.Fields[2].Description);
    }
}