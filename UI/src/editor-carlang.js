﻿export const tokenizer = {
    keywords: [
        "record",
        "choice",
        "data",
        "open",
    ],
    autoClosingPairs: [{ open: "{", close: "}" }],
    digits: /\d+(_+\d+)*/,

    tokenizer: {
        root: [
            { include: 'whitespace' },
            { include: "code_block" },
            { include: "chapter" },
            { include: "annotation" },
            { include: "directive" },
            { include: "lang" },
        ],
        whitespace: [
            [/[ \t\r\n]+/, 'white']
        ],
        chapter: [[/#.*/, "chapter"]],
        annotation: [[/@.*/, "annotation"]],
        code_block: [
            [/^`{3}/, { token: "nothing", next: "@code_block_internal" }]
        ],
        code_block_internal: [
            [/^`{3}/, { token: "nothing", next: "@pop" }]
        ],
        directive: [
            [/(%)([^:]+)/, ["number", "type.identifier"]]
        ],
        lang: [
            // [/({)([a-zA-Z0-9]+)(\.)([a-zA-Z0-9]+)(})/, ["chapter", "type.identifier", "chapter", "annotation.field", "chapter"]],
            [/^([a-z][^ ]*)/, [
                {
                    cases: {
                        // language
                        "open": { token: "keyword" },
                        "record": { token: "keyword", next: "@record" },
                        "type": { token: "keyword", next: "@type" },
                        "choice": { token: "keyword", next: "@choice" },
                        "data": { token: "keyword", next: "@data" },

                        // document
                        "view": { token: "keyword", next: "@view" },
                        "guideline": { token: "keyword", next: "@attributes" },
                        "requirement": { token: "keyword", next: "@attributes" },
                        "include": { token: "keyword", next: "@field" },

                        // planning
                        "roadmap": { token: "keyword", next: "@attributes" },
                        "task": { token: "keyword", next: "@attributes" },
                        "milestone": { token: "keyword", next: "@attributes" },


                        // flows 
                        "flow": { token: "keyword", next: "@attributes" },

                        // architecture
                        "component": { token: "keyword", next: "@attributes" },
                        "interaction": { token: "keyword", next: "@attributes" },
                        "person": { token: "keyword", next: "@attributes" },
                        "system": { token: "keyword", next: "@attributes" },
                        "endpoint": { token: "keyword", next: "@attributes_endpoint" },
                    }
                }]]
        ],
        record: [
            [/extends/, "keyword"],
            [/=/, "number", "@field"],
            [/'[a-z]/, "generic-parameter"], // generic types
            { include: "lang" }
        ],
        view: [
            [/view/, "keyword"],
            { include: "lang" },
            { include: "root" },
        ],
        type: [
            [/->/, "number"],
            [/;/, "number", "@root"],
            [/'[a-z]/, "generic-parameter"], // generic types
            { include: "lang" }
        ],
        choice: [
            [/(|)\w*(")/, ["number", { token: 'string.quote', bracket: '@open', next: '@string' }]],
            { include: "root" },
            { include: "lang" }
        ],
        data: [
            [/'[a-z]/, "generic-parameter"], // generic types
            { include: "root" },
            { include: "lang" }
        ],
        field: [
            [/\d+/, "number"],
            [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
            [/'[a-z]/, "generic-parameter"], // generic types
            { include: "root" },
            { include: "lang" }
        ],
        attributes: [
            [/([A-Z][a-zA-Z0-9_]*)(:)/, ["type.identifier", "number"]],
            { include: "lang" },
            { include: "root" },
        ],
        attributes_endpoint: [
            [/->/, "number"],
            [/([A-Z][a-zA-Z ]*)(::)/, ["nothing", "number"]],
            [/([A-Z][a-zA-Z ]*)(:)/, ["type.identifier", "number"]],
            { include: "lang" }
        ],
        decode_type: [
            [/(List)([^;]*)(;)/, ["type.identifier", "", "number"]],
            [/(Maybe)([^;]*)(;)/, ["type.identifier", "", "number"], "@field"],
            { include: "lang" }
        ],
        string: [
            [/[^\\"]+/, 'string'],
            [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
        ],
        comment: [
            [/[^\*}]+/, 'comment'],
            [/\{\*/, 'comment', '@push'],    // nested comment
            ["\\*}", 'comment', '@pop'],
            [/[\{\*]/, 'comment']
        ]
    }
};

export const theme = {
    base: "vs-dark",
    inherit: true,
    colors: {
        "editor.background": "#273241"
    },
    rules: [
        { token: "chapter", foreground: "#ea5dd5" },
        { token: "annotation", foreground: "#cd9394" },
        { token: "identifier", foreground: "#00aa9e" },
        { token: "basetype", foreground: "#fdf8ea" },
        { token: "generic-parameter", foreground: "#ea5dd5" },
        { token: "annotation.field", foreground: "#ffffff" },
    ]
};

export const createCommands = (monaco, editor, handler) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_P, (e, a, b) => {
        handler({ openDomain: true });
        // console.log(e, a, b);
        // debugger;
        // var model = editor.getModel();
        // var position = editor.getPosition();
        // var { word } = model.getWordAtPosition(position);
        // alert(word);
    });
};

export const createActions = (monaco, editor) => {
    editor.addAction({
        // An unique identifier of the contributed action.
        id: "zdragon_create_type",

        // A label of the action that will be presented to the user.
        label: "Create Type",

        // An optional array of keybindings for the action.
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_E],

        // A precondition for this action.
        precondition: null,

        // A rule to evaluate on top of the precondition in order to dispatch the keybindings.
        keybindingContext: null,

        contextMenuGroupId: "navigation",

        contextMenuOrder: 1.5,

        // Method that will be executed when the action is triggered.
        // @param editor The editor instance is passed in as a convinience
        run: function (ed) {
            var baseTypes = [
                "String",
                "Number",
                "Date",
                "DateTime",
                "Time",
                "Decimal",
                "List",
                "Maybe"
            ];
            var position = editor.getPosition();
            var text = editor.getValue(position);
            var model = editor.getModel();
            var line = model.getLineContent(position.lineNumber);
            var { word } = model.getWordAtPosition(position);

            var newtext;
            if (baseTypes.indexOf(word) == -1) {
                newtext =
                    text +
                    `
type ${word}
`;
            } else {
                let type = line.split(":").map(s => s.trim())[0];
                newtext =
                    text +
                    `
alias ${type} = ${word};
`;
            }
            editor.setValue(newtext);
            editor.setPosition(position);
            return null;
        }
    });
};
