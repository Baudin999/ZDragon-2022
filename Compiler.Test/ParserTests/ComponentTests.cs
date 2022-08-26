namespace Compiler.Test.ParserTests
{
    public class ComponentTests
    {
        [Fact]
        public void SimpleComponent()
        {
            const string code = @"
component Foo
";

            var zdragon = new ZDragon().Compile(code);

            Assert.NotNull(zdragon.Nodes);
            Assert.NotEmpty(zdragon.Nodes);
        }

        [Fact]
        public void ComponentShouldHaveAnIdentifier()
        {
            const string code = @"component";
            var zdragon = new ZDragon().Compile(code);

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
        public void SimpleComponent2()
        {
            const string code = @"
component Foo =
    Title: Foo
    Description: This is the
        Foo component.
    Version: 0
";

            var zdragon = new ZDragon().Compile(code);

            Assert.NotNull(zdragon.Nodes);
            Assert.NotEmpty(zdragon.Nodes);

            var fooNode = (ComponentNode)zdragon.Nodes[0];
            Assert.Equal("Foo", fooNode.Id);
            Assert.Equal(3, fooNode.Attributes.Count);
        }

        [Fact]
        public void TestInteractions()
        {
            const string code = @"
component Foo =
    Interactions:
        - Bar
";
            var zdragon = new ZDragon().Compile(code);

            Assert.NotNull(zdragon.Nodes);
            Assert.NotEmpty(zdragon.Nodes);
            
            var fooNode = (ComponentNode)zdragon.Nodes[0];
            Assert.Single(fooNode.Attributes);
            Assert.Single(zdragon.References);

            var reference = zdragon.References[0];
            Assert.Equal("Foo", reference.From);
            Assert.Equal("Bar", reference.To);
            Assert.Equal(ReferenceType.InteractsWith, reference.Type);
        }

        [Fact]
        public void ExtendComponent()
        {
            const string code = @"
component Foo extends Bar Other
";

            var zdragon = new ZDragon().Compile(code);

            Assert.NotNull(zdragon.Nodes);
            Assert.NotEmpty(zdragon.Nodes);

            var fooNode = (ComponentNode)zdragon.Nodes[0];
            Assert.Equal("Foo", fooNode.Id);
            Assert.Empty(fooNode.Attributes);
            Assert.Equal(2, fooNode.Extends.Count);
        }
        
        [Fact]
        public void ComponentListAttribute()
        {
            const string code = @"
component JusticeLeague =
    Members:
        - Superman
        - Batman
        - Tech Man
";

            var zdragon = new ZDragon().Compile(code);

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
        
        [Fact]
        public void ComponentWithMarkdownNotes()
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

            var zdragon = new ZDragon().Compile(code);

            Assert.NotNull(zdragon.Nodes);
            Assert.Single(zdragon.Nodes);
            
            var foo = (ComponentNode)zdragon.Nodes[0];
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
