namespace Compiler;

public class TokenIterator
{
    protected readonly List<Token> _tokens;
    protected int _index;
    protected int _max = 0;
    private readonly ErrorSink _errorSink;

    protected Token Current => _tokens[this._index];
    protected Token? Next => this._tokens.ElementAtOrDefault(this._index + 1);
    protected Token? Peek(int offset) => _tokens.ElementAtOrDefault(this._index + offset);
    protected bool hasCurrent => _index < _max;
    protected bool hasNext => _index + 1 < _max;


    protected void Abort(string message)
    {
        var target = Current.Clone();
        if (target.StartLine == -1 && _index > 0)
            target = this._tokens[_index - 1].Clone();
        
        _errorSink.Errors.Add(new Error(target, message));
        _ = TakeWhile(() => !Is(TokenKind.END_CONTEXT)).ToList();
    }
    
    protected void MoveNext()
    {
        while (Current == TokenKind.SPACE || Current == TokenKind.NEWLINE) TakeCurrent();
    }
    
    protected Token TakeCurrent() {
        Token current = this._tokens[this._index];
        _index++;
        return current;
    }

    /// <summary>
    /// Forget the next Token and just throw it away
    /// </summary>
    protected void Forget()
    {
        _ = Take();
    } 

    protected Token Take()
    {
        // if you want a real token type, ignore spaces and newlines
        while (Current == TokenKind.SPACE || Current == TokenKind.NEWLINE) TakeCurrent();
        return TakeCurrent();
    }

    protected Token Take(TokenKind kind, string message)
    {
        // if you want a real token type, ignore spaces and newlines
        while (Current == TokenKind.SPACE || Current == TokenKind.NEWLINE) TakeCurrent();

        if (Current != kind)
        {
            Abort(message);
        }
        return TakeCurrent();
    }

    protected Token Take(TokenKind kind)
    {
        return Take(kind, @$"Expected '{kind}' but received a '{Current.Kind}'.");
    }
    protected IEnumerable<Token> TakeWhile(TokenKind kind)
    {
        // Take the tokens if they are of the TokenType type, but
        // skip the NEWLINEs and SPACEs
        while (Is(kind) && Current != TokenKind.EOF)
            yield return Take(kind);
    }
    protected IEnumerable<Token> TakeWhile(Func<bool> predicate)
    {
        while(predicate() && Current != TokenKind.EOF)
        {
            yield return TakeCurrent();
        }
    }
    protected IEnumerable<Token> TakeWhile(Func<Token, bool> predicate)
    {
        while(Current != TokenKind.EOF && predicate(Current))
        {
            yield return TakeCurrent();
        }
    }

    protected IEnumerable<Token> TakeWhileNot(TokenKind kind)
    {
        // Take the tokens if they are of the TokenType type, but
        // skip the NEWLINEs and SPACEs
        while (Current != kind && Current != TokenKind.EOF)
            yield return TakeCurrent();
    }
    
    protected IEnumerable<Token> TakeWhileNot(Func<Token, bool> predicate)
    {
        // Take the tokens if they are of the TokenType type, but
        // skip the NEWLINEs and SPACEs
        while(Current != TokenKind.EOF && predicate(Current))
        {
            yield return TakeCurrent();
        }
    }


    /// <summary>
    /// Non permanent look ahead.
    /// </summary>
    /// <param name="kind"></param>
    /// <returns></returns>
    protected bool Is(TokenKind kind)
    {
        if (!hasNext) return false;
        
        // we do not want to actually progress through the tokens when we are checking.
        var i = 0;
        
        // if you want a real token type, ignore spaces and newlines
        var token = Peek(i);
        while (token == TokenKind.SPACE || token == TokenKind.NEWLINE || token == TokenKind.EOF)
        {
            i++;
            token = Peek(i);
        }
        
        return token == kind;
    }
    
    protected bool Is(string value)
    {
        if (!hasNext) return false;
        
        // we do not want to actually progress through the tokens when we are checking.
        var i = 0;
        
        // if you want a real token type, ignore spaces and newlines
        var token = Peek(i);
        while (token == TokenKind.SPACE || token == TokenKind.NEWLINE || token == TokenKind.EOF)
        {
            i++;
            token = Peek(i);
        }
        
        return token?.Value == value;
    }

    protected bool Or(params TokenKind[] kinds)
    {
        if (!hasNext) return false;
        
        // we do not want to actually progress through the tokens when we are checking.
        var i = 0;
        
        // if you want a real token type, ignore spaces and newlines
        var token = Peek(i);
        while (token == TokenKind.SPACE || token == TokenKind.NEWLINE || token == TokenKind.EOF)
        {
            i++;
            token = Peek(i);
        }

        foreach (var kind in kinds)
        {
            if (token == kind) return true;
        }

        return false;
    }
    

    protected bool IsNot(TokenKind kind, Action handler)
    {
        if (!Is(kind)) handler.Invoke();
        return false;
    }
    

    protected bool IsOperator() => IsOperator(Current);
    
    protected bool IsOperator(Token test)
    {
        
        // if you want a real token type, ignore spaces and newlines
        while (Current == TokenKind.SPACE || Current == TokenKind.NEWLINE) TakeCurrent();
        
        return 
            test == TokenKind.Minus ||
            test == TokenKind.Plus ||
            test == TokenKind.Star ||
            test == TokenKind.Backslash;
    }

    protected void If(TokenKind kind, Action parse, Action? elseParse = null)
    {
        if (Is(kind))
            parse();
        else
        {
            elseParse?.Invoke();
        }
    }

    protected void If(string value, Action parse, Action? elseParse = null)
    {
        if (Is(value))
            parse();
        else
        {
            elseParse?.Invoke();
        }
    }


    protected void While(TokenKind kind, Action parse)
    {
        while (Is(kind))
            parse();
    }
    
    protected IEnumerable<bool> While(params TokenKind[] tokens)
    {
        while (Or(tokens) && Current != TokenKind.EOF)
        {
            yield return Or(tokens);
        }
    }
    
    protected IEnumerable<bool> WhileNot(params TokenKind[] tokens)
    {
        while (!Or(tokens) && Current != TokenKind.EOF)
        {
            yield return !Or(tokens);
        }
    }
    
    
    protected TokenIterator(List<Token> tokens, ErrorSink errorSink)
    {
        this._tokens = tokens;
        this._max = tokens.Count;
        this._index = 0;
        this._errorSink = errorSink;
    }
}