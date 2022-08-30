namespace Compiler.Test.ParserTests
{
    public class ComponentTests
    {
        [Fact]
        public async void SimpleComponent()
        {
            const string code = @"
component Foo
";

            var zdragon = await new ZDragon().Compile(code);

            Assert.NotNull(zdragon.Nodes);
            Assert.NotEmpty(zdragon.Nodes);
        }

        [Fact]
        public async void ComponentShouldHaveAnIdentifier()
        {
            const string code = @"component";
            var zdragon = await new ZDragon().Compile(code);

            Assert.NotNull(zdragon.Nodes);
            Assert.Empty(zdragon.Nodes);
            Assert.NotNull(zdragon.Errors);
            Assert.Single(zdragon.Errors);

            Assert.Equal(@"A component should have an Identifier to name the component, for example:

component Foo

Where 'Foo' is the identifier of the component.", zdragon.Errors[0].Message);
            Assert.Equal(0, zdragon.Errors[0].Source.StartLine);
            Assert.Equal(0, zdragon.Errors[0].Source.EndLine);
            Assert.Equal(0, zdragon.Errors[0].Source.StartColumn);
            Assert.Equal(9, zdragon.Errors[0].Source.EndColumn);
        }

        [Fact]
        public async void SimpleComponent2()
        {
            const string code = @"
component Foo =
    Title: Foo
    Description: This is the
        Foo component.
    Version: 0
";

            var zdragon = await new ZDragon().Compile(code);

            Assert.NotNull(zdragon.Nodes);
            Assert.NotEmpty(zdragon.Nodes);

            var fooNode = (ComponentNode)zdragon.Nodes[0];
            Assert.Equal("Foo", fooNode.Id);
            Assert.Equal(3, fooNode.Attributes.Count);
        }
        
        [Fact]
        public async void SimpleComponent3()
        {
            const string code = @"
component Foo =
    Title: Foo
    Description: This is the
        Foo component. And let's
        do some more lines
        To test the items
    Version: 0
    Notes:
        # Chapter
        
        With a paragraph.
    Model: Person
";

            var zdragon = await new ZDragon().Compile(code);

            Assert.NotNull(zdragon.Nodes);
            Assert.NotEmpty(zdragon.Nodes);

            var fooNode = (ComponentNode)zdragon.Nodes[0];
            Assert.Equal("Foo", fooNode.Id);
            Assert.Equal(5, fooNode.Attributes.Count);
        }

        [Fact]
        public async void TestInteractions()
        {
            const string code = @"
component Foo =
    Interactions:
        - Bar
";
            var zdragon = await new ZDragon().Compile(code);

            Assert.NotNull(zdragon.Nodes);
            Assert.NotEmpty(zdragon.Nodes);
            
            var fooNode = (ComponentNode)zdragon.Nodes[0];
            Assert.Single(fooNode.Attributes);
            Assert.Equal(2, zdragon.References.Count);

            var reference = zdragon.References[1];
            Assert.Equal("Foo", reference.From);
            Assert.Equal("Bar", reference.To);
            Assert.Equal(ReferenceType.InteractsWith, reference.Type);

            Assert.Single(zdragon.Errors);
        }

        [Fact]
        public async void ExtendComponent()
        {
            const string code = @"
component Foo extends Bar Other
";

            var zdragon = await new ZDragon().Compile(code);

            Assert.NotNull(zdragon.Nodes);
            Assert.NotEmpty(zdragon.Nodes);

            var fooNode = (ComponentNode)zdragon.Nodes[0];
            Assert.Equal("Foo", fooNode.Id);
            Assert.Empty(fooNode.Attributes);
            Assert.Equal(2, fooNode.ExtensionTokenTokens.Count);
        }
        
        [Fact]
        public async void ComponentListAttribute()
        {
            const string code = @"
component JusticeLeague =
    Members:
        - Superman
        - Batman
        - Tech Man
";

            var zdragon = await new ZDragon().Compile(code);

            Assert.NotNull(zdragon.Nodes);
            Assert.NotEmpty(zdragon.Nodes);

            var justiceLeagueNode = (ComponentNode)zdragon.Nodes[0];
            Assert.Equal("JusticeLeague", justiceLeagueNode.Id);
            Assert.Single(justiceLeagueNode.Attributes);

            var members = justiceLeagueNode.Attributes[0];
            Assert.NotNull(members);
            Assert.True(members.IsList);
            Assert.Equal(3, members.Items?.Count);
            Assert.Equal("Superman", members.Items?[0]);
            Assert.Equal("Batman", members.Items?[1]);
            Assert.Equal("Tech Man", members.Items?[2]);
        }

        [Fact(DisplayName = "Component with annotations")]
        public async void ComponentWithAnnotations()
        {
            const string code = @"
@ The Justice League
@ of America
component JusticeLeague =
    @ The current members of the JL
    Members:
        - Superman
        - Batman
        - Tech Man
";

            var zdragon = await new ZDragon().Compile(code);

            Assert.NotNull(zdragon.Nodes);
            Assert.NotEmpty(zdragon.Nodes);

            var justiceLeagueNode = (ComponentNode)zdragon.Nodes[0];
            Assert.Equal("JusticeLeague", justiceLeagueNode.Id);
            Assert.Single(justiceLeagueNode.Attributes);
            Assert.Equal(@"The Justice League
of America", justiceLeagueNode.Description);

            var members = justiceLeagueNode.Attributes[0];
            Assert.NotNull(members);
            Assert.True(members.IsList);
            Assert.Equal(3, members.Items?.Count);
            Assert.Equal("Superman", members.Items?[0]);
            Assert.Equal("Batman", members.Items?[1]);
            Assert.Equal("Tech Man", members.Items?[2]);
        }

        [Fact]
        public async void ComponentWithMarkdownNotes()
        {
            const string code = @"
component Foo =
    Notes:
        # These are the notes
        
        And with these notes we can
        write anything we want:

         * Bullet 1
         * Bullet 2
            * Indent 1
         * Bullet 3
";

            var zdragon = await new ZDragon().Compile(code);

            Assert.NotNull(zdragon.Nodes);
            Assert.Single(zdragon.Nodes);
            
            var foo = (ComponentNode)zdragon.Nodes[0];
            Assert.Single(foo.Attributes);
            var attribute = foo.Attributes[0];
            
            Assert.Equal(@"# These are the notes

And with these notes we can
write anything we want:

 * Bullet 1
 * Bullet 2
    * Indent 1
 * Bullet 3", attribute.Value);
        }
    }
}
