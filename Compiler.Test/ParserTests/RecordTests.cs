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


    [Fact(DisplayName = "Fields with maybe and list types")]
    public void FieldWith()
    {
        const string code = @"
type Name = String
record Person =
    FirstName: Maybe Name
    LastName: Name
    Hobbies: List String
";
        
        var zdragon = new ZDragon().Compile(code);

        Assert.NotNull(zdragon.Nodes);
        Assert.Equal(2, zdragon.Nodes.Count); 
        Assert.IsType<RecordNode>(zdragon.Nodes[1]);
        
        var record = (RecordNode)zdragon.Nodes[1];
        Assert.Equal("Person", record.Id);
        Assert.Equal(3, record.Attributes.Count);
        Assert.Equal("FirstName", record.Attributes[0].Id);
        Assert.Equal("Maybe Name", record.Attributes[0].Type);
        Assert.Equal(2, record.Attributes[0].TypeTokens.Count);
        
        Assert.Equal("LastName", record.Attributes[1].Id);
        Assert.Equal("Name", record.Attributes[1].Type);
        Assert.Single(record.Attributes[1].TypeTokens);

        Assert.Equal("Hobbies", record.Attributes[2].Id);
        Assert.Equal("List String", record.Attributes[2].Type);
        Assert.Equal(2, record.Attributes[2].TypeTokens.Count);

    }
}