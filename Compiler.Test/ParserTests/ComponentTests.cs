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
    }
}
