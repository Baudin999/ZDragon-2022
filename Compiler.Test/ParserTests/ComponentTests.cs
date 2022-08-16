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
            Assert.Equal(8, zdragon.Errors[0].Source.EndColumn);
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
    }
}
