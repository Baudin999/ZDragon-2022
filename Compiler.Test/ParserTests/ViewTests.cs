namespace Compiler.Test.ParserTests;

public class ViewTests
{
    [Fact(DisplayName = "Simple View")]
    public async void SimpleView()
    {
        const string code = @"
view Marketing =
    OfferStore
    IdentificationService
";
        
        var zdragon = await new ZDragon().Compile(code);

        Assert.NotNull(zdragon.Nodes);
        Assert.NotEmpty(zdragon.Nodes);
        Assert.Single(zdragon.Nodes);

        Assert.IsType<ViewNode>(zdragon.Nodes[0]);
        var marketingNode = (ViewNode)zdragon.Nodes[0];
        Assert.Equal("Marketing", marketingNode.Id);
        Assert.Equal(2, marketingNode.Children.Count);

    }
}