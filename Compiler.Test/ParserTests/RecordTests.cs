namespace Compiler.Test.ParserTests;

public class RecordTests
{
    [Fact(DisplayName = "Create simple record")]
    public void CreateSimpleRecord()
    {
        const string code = @"
record Person =
    name: string
    age: int";
        
        var zdragon = new ZDragon().Compile(code);

        Assert.NotNull(zdragon.Nodes);
        Assert.Single(zdragon.Nodes); 
        Assert.IsType<RecordNode>(zdragon.Nodes[0]);
        
        var record = (RecordNode)zdragon.Nodes[0];
        Assert.Equal("Person", record.Id);
        Assert.Equal(2, record.Attributes.Count);
        Assert.Equal("name", record.Attributes[0].Id);
        Assert.Equal("string", record.Attributes[0].Type);
        Assert.Equal("age", record.Attributes[1].Id);
        Assert.Equal("int", record.Attributes[1].Type);
        
        Assert.Equal(3, zdragon.References.Count);
    }
    
    
    [Fact(DisplayName = "Create simple record with annotations")]
    public void CreateSimpleRecordWithAnnotations()
    {
        const string code = @"
@ The person record
@ With some more information
@ on the Person record type
record Person =
    @ The name of the person
    name: string

    @ The age of the person
    @ with a second annotation
    age: int";
        
        var zdragon = new ZDragon().Compile(code);

        Assert.NotNull(zdragon.Nodes);
        Assert.Single(zdragon.Nodes); 
        Assert.IsType<RecordNode>(zdragon.Nodes[0]);
        
        var record = (RecordNode)zdragon.Nodes[0];
        Assert.Equal("Person", record.Id);
        Assert.Equal(@"The person record
With some more information
on the Person record type", record.Description);
        
        Assert.Equal(2, record.Attributes.Count);
        Assert.Equal("name", record.Attributes[0].Id);
        Assert.Equal("string", record.Attributes[0].Type);
        Assert.Equal("The name of the person", record.Attributes[0].Description);
        
        Assert.Equal("age", record.Attributes[1].Id);
        Assert.Equal("int", record.Attributes[1].Type);
        Assert.Equal(@"The age of the person
with a second annotation", record.Attributes[1].Description);
    }
    
    
    // [Fact(DisplayName = "Fields with maybe and list types")]
    // public void FieldWith
}