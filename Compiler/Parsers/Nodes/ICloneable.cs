namespace Compiler.Parsers.Nodes;

public interface ICloneable<T> where T: ICloneable<T>
{
    T Clone();
}