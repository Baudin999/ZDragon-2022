namespace Compiler.Parsers
{
    public partial class Parser
    {

        private ComponentNode? parseComponent()
        {
            var result = parseArchitectureNode(TokenKind.KWComponent);
            if (result is null) return null;
            var (id, attributes, extensions, annotations) = result.Value; 
            return new ComponentNode(id, attributes, extensions, annotations);
        }
        
        private (Token, List<ComponentAttribute>, List<Token>, List<Token>)? parseArchitectureNode(TokenKind kind)
        {
            var kw = Take(kind);
            var annotations = TakeWhile(TokenKind.Annotation).ToList();
            var id = TakeArchitectureIdentifier("component");
            if (id is null) return null;

            var attributes = new List<ComponentAttribute>();
            var extensions = new List<Token>();

            parseExtensions(extensions, id);

            // parse the body of the component
            parseAchitectureBody(attributes);
            
            
            
            return new (id, attributes, extensions, annotations);
        }

        private void parseExtensions(List<Token> extensions, Token id)
        {
            // parse the extensions
            If(TokenKind.KWExtends, () =>
            {
                _ = Take(TokenKind.KWExtends);
                extensions.AddRange(TakeWhile(TokenKind.Identifier).ToList());
                foreach (var ext in extensions)
                {
                    References.Add(new NodeReference(id, ext, ReferenceType.ExtendedBy));
                }
            });
        }


        private void parseAchitectureBody(List<ComponentAttribute> attributes)
        {
            // parse the body of the component
            If(TokenKind.Equal,
                () =>
                {
                    _ = Take(TokenKind.Equal);
                    while (Is(TokenKind.START))
                    {
                        var attribute = parseArchitectureAttribute();
                        if (attribute is not null)
                            attributes.Add(attribute);
                    }
                }, () => { If(TokenKind.START, () => { Abort("Expected '=' after 'system'"); }); });
        }

       

        private ComponentAttribute? parseArchitectureAttribute()
        {
            Take(TokenKind.START);
            var annotations = TakeWhile(TokenKind.Annotation).ToList();
            var id = Take(TokenKind.Word);
            List<ComponentAttributeListItem>? componentListAttributes = null;
            List<Token>? valueTokens = null;
            //var depth = new Stack<Token>();

            // if there is no colon, we abort, this is probably in a view
            // or an empty attribute in a component
            if (Is(TokenKind.Colon))
            {
                var colon = Take(TokenKind.Colon);
                
                if (Is(TokenKind.START_LIST_ITEM))
                {
                    componentListAttributes = extractComponentListAttributes();
                }
                else
                {
                    // parse the node as a single textual value
                    _ = TakeWhile(t => t == TokenKind.NEWLINE || t == TokenKind.SPACE).ToList();
                    valueTokens = TakeWhile(t => t != TokenKind.END && t != TokenKind.END_CONTEXT).ToList();
                    if (Current == TokenKind.END)
                        Take(TokenKind.END);
                }
            }

            // there could have been multiple indentations, these
            // result in multiple ends.
            while (hasCurrent && Current == TokenKind.END)
                Take();
                

            return new ComponentAttribute(id, valueTokens, componentListAttributes, annotations);
        }

        private List<ComponentAttributeListItem> extractComponentListAttributes()
        {
            List<ComponentAttributeListItem> listItems = new List<ComponentAttributeListItem>();
            // parse the list item
            while (Is(TokenKind.START_LIST_ITEM))
            {
                _ = Take(TokenKind.START_LIST_ITEM);
                var listItemAnnotations = TakeWhile(TokenKind.Annotation).ToList();
                var i = 0;
                List<List<Token>> parts = new List<List<Token>>();
                while (Current != TokenKind.END_LIST_ITEM && Current != TokenKind.END)
                {
                    if (Current == TokenKind.SemiColon)
                    {
                        i++;
                        TakeCurrent();
                    }
                    else
                    {
                        while (parts.Count < i + 1)
                        {
                            parts.Add(new List<Token>());
                        }
                        parts[i].Add(TakeCurrent());
                    }
                }

                if (Current == TokenKind.END_LIST_ITEM) TakeCurrent();

                var length = parts.Count;
                var idTokens = parts[0];
                var titleTokens = length > 1 ? parts[1] : null;
                var technologyTokens = length > 2 ? parts[2] : null;
                var directionTokens = length > 3 ? parts[3] : null;
                listItems.Add(new ComponentAttributeListItem(idTokens, titleTokens, technologyTokens, directionTokens));
            }

            return listItems;
        }

        private Token? TakeArchitectureIdentifier(string name)
        {
            var id = Take(TokenKind.Identifier, $@"A {name} should have an Identifier to name the {name}, for example:

{name} Foo

Where 'Foo' is the identifier of the {name}.");

            return id != TokenKind.Identifier ? null : id;
        }
    }
}
