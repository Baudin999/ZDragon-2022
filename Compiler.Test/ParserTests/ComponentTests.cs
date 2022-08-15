namespace Compiler.Test.ParserTests
{
    public class ComponentTests
    {
        [Fact]
        public void SimpleComponent()
        {
            var code = @"
component Foo
";

            var zdragon = new ZDragon().Compile(code);

            Assert.NotNull(zdragon.Nodes);
            Assert.NotEmpty(zdragon.Nodes);
        }

        [Fact]
        public void ComponentShouldHaveAnIdentifier()
        {
            var code = @"component";
            var zdragon = new ZDragon().Compile(code);

            Assert.NotNull(zdragon.Nodes);
            Assert.Empty(zdragon.Nodes);
            Assert.NotNull(zdragon.Errors);
            Assert.Single(zdragon.Errors);

        }

        [Fact]
        public void SimpleComponent2()
        {
            var code = @"
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
            var code = @"
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
