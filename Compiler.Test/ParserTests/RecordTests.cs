namespace Compiler.Test.ParserTests;

public class RecordTests
{
    [Fact(DisplayName = "Create simple record")]
    public async void CreateSimpleRecord()
    {
        const string code = @"
record Person =
    name: string
    age: int";
        
        var zdragon = await new ZDragon().Compile(code);

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
        
        Assert.Single(zdragon.References);
    }
    
    
    [Fact(DisplayName = "Create simple record with annotations")]
    public async void CreateSimpleRecordWithAnnotations()
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
        
        var zdragon = await new ZDragon().Compile(code);

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
    public async void FieldWith()
    {
        const string code = @"
type Name = String
record Person =
    FirstName: Maybe Name
    LastName: Name
    Hobbies: List String
";
        
        var zdragon = await new ZDragon().Compile(code);

        Assert.NotNull(zdragon.Nodes);
        Assert.Empty(zdragon.Errors);
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


    [Fact(DisplayName = "Field Restriction")]
    public async void ParseRecordFieldWithRestrictions()
    {
        const string code = @"
record Person =

    @ The firstName of the person
    FirstName: String
        & min 4
        & max 12
    
    @ The last Name of the person
    LastName: String & min 2 & default ""asdadsas""
";
        var zdragon = await new ZDragon().Compile(code);
        Assert.NotNull(zdragon.Nodes);
        Assert.Single(zdragon.Nodes);
        Assert.IsType<RecordNode>(zdragon.Nodes[0]);

        var personNode = (RecordNode)zdragon.Nodes.First();
        Assert.Equal(2, personNode.Attributes.Count);

        var firstNameAttribute = (RecordFieldNode)personNode.Attributes[0];
        Assert.Equal("FirstName", firstNameAttribute.Id);
        Assert.Equal("String", firstNameAttribute.Type);
        Assert.Equal(2, firstNameAttribute.FieldRestrictions.Count);
        Assert.Equal("min", firstNameAttribute.FieldRestrictions[0].Key);
        Assert.Equal("4", firstNameAttribute.FieldRestrictions[0].Value);
        Assert.Equal("max", firstNameAttribute.FieldRestrictions[1].Key);
        Assert.Equal("12", firstNameAttribute.FieldRestrictions[1].Value);
        
        var lastNameAttribute = (RecordFieldNode)personNode.Attributes[1];
        Assert.Equal("LastName", lastNameAttribute.Id);
        Assert.Equal("String", lastNameAttribute.Type);
        Assert.Equal(2, lastNameAttribute.FieldRestrictions.Count);
        Assert.Equal(2, lastNameAttribute.FieldRestrictions.Count);
        Assert.Equal("min", lastNameAttribute.FieldRestrictions[0].Key);
        Assert.Equal("2", lastNameAttribute.FieldRestrictions[0].Value);
        Assert.Equal("default", lastNameAttribute.FieldRestrictions[1].Key);
        Assert.Equal("asdadsas", lastNameAttribute.FieldRestrictions[1].Value);
    }
    
    [Fact(DisplayName = "Validate the field types")]
    public async void ValidateFieldType()
    {
        const string code = @"
record Person =
    FirstName: Name
    LastName: String
    Age: Age

component Name
component Age
";
        var zdragon = await new ZDragon().Compile(code);
        Assert.Equal(2, zdragon.Errors.Count);
    }
    
    
    
}