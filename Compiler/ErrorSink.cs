namespace Compiler
{
    public class ErrorSink
    {
        public List<Error> Errors { get; }

        public ErrorSink()
        {
            Errors = new List<Error>();
        }
    }


    public class Error
    {
        //
        public Token Source { get; }
        public string Message {get;}

        public Error(Token source, string message)
        {
            this.Source = source;
            this.Message = message;
        }

        public override string ToString()
        {
            return Message;
        }
    }
}
