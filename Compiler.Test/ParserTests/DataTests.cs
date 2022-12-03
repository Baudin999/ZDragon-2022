namespace Compiler.Test.ParserTests;

public class DataTests
{
    [Fact(DisplayName = "Create Data Node")]
    public async void CreateDataNode()
    {
        const string code = @"
record BaseAddress
record HomeAddress extends BaseAddress
record InvoiceAddress extends BaseAddress


@ This is the address 
@ sum type
data Address =
    | HomeAddress

    @ The invoice address
    | InvoiceAddress 
";
        
        var zdragon = await new ZDragon().Compile(code);
        Assert.Equal(4, zdragon.Nodes.Count);

        Assert.IsType<DataNode>(zdragon.Nodes.Last());
        var dataNode = (DataNode)zdragon.Nodes.Last();
        Assert.Equal("Address", dataNode.Id);
        Assert.Equal(@"This is the address
sum type", dataNode.Description);
        Assert.Equal(2, dataNode.Fields.Count);
        Assert.Equal("", dataNode.Fields[0].Description);
        Assert.Equal("HomeAddress", dataNode.Fields[0].TypeTokens[0].Value);
        Assert.Equal("The invoice address", dataNode.Fields[1].Description);
        Assert.Equal("InvoiceAddress", dataNode.Fields[1].TypeTokens[0].Value);
        
        
        Assert.Equal("BaseAddress", ((IIdentifier)zdragon.Nodes[0]).Id);
        Assert.Equal("HomeAddress", ((IIdentifier)zdragon.Nodes[1]).Id);
        Assert.Equal("InvoiceAddress", ((IIdentifier)zdragon.Nodes[2]).Id);
        
        Assert.Empty(zdragon.Errors);
    }
    
    [Fact(DisplayName = "Field Types Must Exist")]
    public async void FieldTypesMustExist()
    {
        const string code = @"
data Address =
    | HomeAddress
    | InvoiceAddress 
";
        
        var zdragon = await new ZDragon().Compile(code);
        Assert.Single(zdragon.Nodes);
        Assert.IsType<DataNode>(zdragon.Nodes.Last());
        var dataNode = (DataNode)zdragon.Nodes.Last();
        Assert.Equal("Address", dataNode.Id);
        Assert.Equal(2, dataNode.Fields.Count);
        Assert.Equal("HomeAddress", dataNode.Fields[0].TypeTokens[0].Value);
        Assert.Equal("InvoiceAddress", dataNode.Fields[1].TypeTokens[0].Value);
        
        Assert.Equal(3, zdragon.References.Count);
        Assert.Equal(2, zdragon.Errors.Count);
        Assert.Equal("Type 'HomeAddress' does not exist", zdragon.Errors[0].Message);
        Assert.Equal("Type 'InvoiceAddress' does not exist", zdragon.Errors[1].Message);
        
    }
}