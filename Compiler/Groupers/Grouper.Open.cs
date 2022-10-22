namespace Compiler.Groupers;

public partial class Grouper
{
    private void GroupOpen()
    {
        tokens.Add(Token.START_CONTEXT);
        tokens.Add(Take());
                    
        string open = "";
        while (Current != TokenKind.NEWLINE)
        {
            if (Current == TokenKind.Word || Current == TokenKind.SPACE || Current == TokenKind.Dot)
            {
                open += Current.Value;
            }
            tokens.Add(TakeCurrent());
        }
        OpenNamespaces.Add(open.Trim());
        tokens.Add(Token.END_CONTEXT);
        _index++;
    }
}