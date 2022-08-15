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

            var lexer = new Lexer(code);
            lexer.Lex();
            var tokens = new Grouper(lexer.Tokens).Group();
            var nodes = new Parser(tokens).Parse();

            Assert.NotNull(nodes);
            Assert.NotEmpty(nodes);
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

            var lexer = new Lexer(code);
            lexer.Lex();
            var tokens = new Grouper(lexer.Tokens).Group();
            var nodes = new Parser(tokens).Parse();

            Assert.NotNull(nodes);
            Assert.NotEmpty(nodes);

            var fooNode = (ComponentNode)nodes[0];
            Assert.Equal("Foo", fooNode.Id);
            Assert.Equal(3, fooNode.Attributes.Count);
        }

        [Fact]
        public void ExtendComponent()
        {
            var code = @"
component Foo extends Bar Other
";

            var lexedTokens = new Lexer(code).Lex();
            var groupedTokens = new Grouper(lexedTokens).Group();
            var nodes = new Parser(groupedTokens).Parse();

            Assert.NotNull(nodes);
            Assert.NotEmpty(nodes);

            var fooNode = (ComponentNode)nodes[0];
            Assert.Equal("Foo", fooNode.Id);
            Assert.Empty(fooNode.Attributes);
            Assert.Equal(2, fooNode.Extends.Count);
        }
    }
}
