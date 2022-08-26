﻿namespace Compiler.Parsers
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

            Token? value = null;
            var depth = new Stack<Token>();
            while (!(Current == TokenType.END && depth.Count == 0))
            {
                
                if (Current == TokenType.START)
                {
                    //value?.Add(Environment.NewLine);
                    for (int i = 0; i < depth.Count * 4; ++i)
                    {
                        // add spaces per indentation to the value
                        value?.Add(' ');
                    }
                    depth.Push(TakeNext());
                }
                else if (Current == TokenType.SAMEDENT)
                {
                    value?.Add(Environment.NewLine);
                    TakeNext();
                }
                else if (Current == TokenType.END)
                {
                    TakeNext();
                    depth.Pop();
                }
                else
                {
                    if (value is null)
                    {
                        value = TakeNext().Clone();
                    }
                    else
                    {
                        value?.Append(TakeNext());
                    }
                }
            }

            // there could have been multiple indentations, these
            // result in multiple ends.
            while (Current == TokenType.END)
                Take();

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
