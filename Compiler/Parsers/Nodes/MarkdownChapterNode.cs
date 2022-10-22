using System.Text.RegularExpressions;

namespace Compiler.Parsers.Nodes;

public class MarkdownChapterNode : MarkdownNode
{
    [JsonConstructor]
    public MarkdownChapterNode(Token valueToken, List<StyleElement>? styleElements = null)
    {
        ValueToken = valueToken;
        Content = Regex.Replace(Value, "^# *", "");
        if (styleElements is not null)
            this.Styles = styleElements;
    }

}
