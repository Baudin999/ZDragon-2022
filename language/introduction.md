
# ZDragon

ZDragon is an architecture documentation tool, written so that we can focus on the architecture of 
a project and not have to worry about layout or other visual aspects. ZDragon inherits a lot from 
LaTeX but it also feels closer to Markdown in some other ways.

The core of ZDragon is the ability to mix certain languages inside of the same file. For example,
defining a component would look something like:

```zdragon
component Foo =
    Title: Foo 
    Description: This is a description
        of the foo component.
```

Another example:

```zdragon
component Foo =
    Title: Foo
    Interactions:
        - Bar
        - Bas
        
    @ Some annotations
    @ spread over multiple lines
    Notes:
        # Chapter
        
        A paragraph with some extra stuff
        
        Bullets:
        * One
        * Two
            *Sub-Two
        * Three
```