namespace Compiler.Parsers
{
    public partial class Parser
    {
        private ComponentNode? parseComponent()
        {
            var kw = Take(TokenType.KWComponent);
            var annotations = TakeWhile(TokenType.Annotation).ToList();
            var id = TakeArchitectureIdentifier("component");
            if (id is null) return null;

            var attributes = new List<ComponentAttribute>();
            var extensions = new List<Token>();

            // parse the extensions
            If(TokenType.KWExtends, () =>
            {
                _ = Take(TokenType.KWExtends);
                extensions.AddRange(TakeWhile(TokenType.Word).ToList());
            });

            // parse the body of the component
            parseAchitectureBody(attributes);

            return new ComponentNode(id, attributes, extensions, annotations);
        }

       

        private ComponentAttribute? parseArchitectureAttribute()
        {
            Take(TokenType.START);
            var annotations = TakeWhile(TokenType.Annotation).ToList();
            var id = Take(TokenType.Word);
            var colon = Take(TokenType.Colon);

            var value = TakeNext().Clone();
            if (value is null) throw new Exception("Invalid component value.");
            var depth = new Stack<Token>();
            while (!(Current == TokenType.END && depth.Count == 0))
            {
                
                /*
                 * This is the parser for the content of an attribute,
                 * an attribute can be either a:
                 *  - Literal value (string or number) but with the string without quotes
                 *  - A literal piece of markdown
                 *  - A list
                 *  - A reference to a function
                 *  - A reference to a type
                 *
                 * Currently we only have literals and markdown, the other parts need to
                 * be added. They will probably be "field name specific". For example,
                 * when a field is called "Model" we will need a Record type to exist
                 * with that name.
                 */
                
                if (Current == TokenType.START)
                {
                    value.Add(Environment.NewLine);
                    for (int i = 0; i < depth.Count * 4; ++i)
                    {
                        // add spaces per indentation to the value
                        value.Add(' ');
                    }
                    depth.Push(TakeNext());
                }
                else if (Current == TokenType.SAMEDENT)
                {
                    value.Add(Environment.NewLine);
                    _ = TakeNext();
                }
                else if (Current == TokenType.END)
                {
                    TakeNext();
                    depth.Pop();
                }
                else if (Current == TokenType.NEWLINE)
                {
                    if (Next == TokenType.END)
                        value.Add(Environment.NewLine);
                    _ = TakeNext();
                }
                else
                {
                    value.Append(TakeNext());
                }
            }

            // there could have been multiple indentations, these
            // result in multiple ends.
            while (Current == TokenType.END)
                Take(TokenType.END);

            return new ComponentAttribute(id, value, annotations);
        }

        private Token? TakeArchitectureIdentifier(string name)
        {
            var id = Take(TokenType.Word, $@"A {name} should have an Identifier to name the {name}, for example:

{name} Foo

Where 'Foo' is the identifier of the {name}.");

            return id != TokenType.Word ? null : id;
        }
    }
}
