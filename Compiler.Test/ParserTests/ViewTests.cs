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
        Assert.Equal("OfferStore", marketingNode.Children[0].Id);
        Assert.Equal("IdentificationService", marketingNode.Children[1].Id);
        Assert.Equal(2, zdragon.Errors.Count);
        
    }
    
    [Fact(DisplayName = "Extend component in View")]
    public async void ExtendComponentInView()
    {
        const string code = @"
view Marketing =
    OfferStore =
        Title: OfferStore Title
    IdentificationService

component OfferStore
component IdentificationService
";
        
        var zdragon = await new ZDragon().Compile(code);

        Assert.NotNull(zdragon.Nodes);
        Assert.NotEmpty(zdragon.Nodes);
        Assert.Equal(3, zdragon.Nodes.Count);

        Assert.IsType<ViewNode>(zdragon.Nodes[0]);
        var marketingNode = (ViewNode)zdragon.Nodes[0];
        Assert.Equal("Marketing", marketingNode.Id);
        Assert.Equal(2, marketingNode.Children.Count);
        Assert.Equal("OfferStore", marketingNode.Children[0].Id);
        Assert.Single(marketingNode.Children[0].Attributes);
        Assert.Equal("IdentificationService", marketingNode.Children[1].Id);

        Assert.Empty(zdragon.Errors);
        
    }
    
    
    [Fact(DisplayName = "Extend component in View with interactions")]
    public async void ExtendAView()
    {
        const string code = @"
view Marketing extends Other =
    OfferStore =
        Title: OfferStore Title
        Interactions:
            - Baseline
    IdentificationService

view Other =
    Baseline
    Gateway

component Baseline
component Gateway
component OfferStore
component IdentificationService
";
        
        var zdragon = await new ZDragon().Compile(code);

        Assert.NotNull(zdragon.Nodes);
        Assert.NotEmpty(zdragon.Nodes);
        Assert.Equal(6, zdragon.Nodes.Count);

        Assert.IsType<ViewNode>(zdragon.Nodes[0]);
        var marketingNode = (ViewNode)zdragon.Nodes[0];
        Assert.Equal("Marketing", marketingNode.Id);
        
        // Marketing has two children and 2 by extension from Other
        Assert.Equal(4, marketingNode.Children.Count);

        Assert.IsType<ViewNode>(zdragon.Nodes[1]);
        var otherNode = (ViewNode)zdragon.Nodes[1];
        Assert.Equal("Other", otherNode.Id);
        Assert.Equal(2, otherNode.Children.Count);
        
        Assert.Empty(zdragon.Errors);
        
    }
    
    
    
    [Fact(DisplayName = "Extend component in View - 2")]
    public async void ExtendAView_OverlappingChild()
    {
        const string code = @"
view Marketing extends Other =
    OfferStore =
        Title: OfferStore Title
        Interactions:
            - Baseline
    IdentificationService
    Baseline =
        Title: Base-line

view Other =
    Baseline
    Gateway

component Baseline
component Gateway
component OfferStore
component IdentificationService
";
        
        var zdragon = await new ZDragon().Compile(code);

        Assert.NotNull(zdragon.Nodes);
        Assert.NotEmpty(zdragon.Nodes);
        Assert.Equal(6, zdragon.Nodes.Count);

        Assert.IsType<ViewNode>(zdragon.Nodes[0]);
        var marketingNode = (ViewNode)zdragon.Nodes[0];
        Assert.Equal("Marketing", marketingNode.Id);
        
        // Marketing has two children and 2 by extension from Other
        Assert.Equal(4, marketingNode.Children.Count);

        Assert.IsType<ViewNode>(zdragon.Nodes[1]);
        var otherNode = (ViewNode)zdragon.Nodes[1];
        Assert.Equal("Other", otherNode.Id);
        Assert.Equal(2, otherNode.Children.Count);
        
        Assert.Empty(zdragon.Errors);
        
    }
}