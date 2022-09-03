<script>
    import { onMount, onDestroy } from "svelte";
    import { writable } from "svelte/store";
    
    export let text = "";
    export let language = "carlang";
    export let theme = "carlangTheme";
    export let wordWrap = true;
    export let markers = writable([]);
    // export let context = [];
    
    let id = "editor-" + Math.floor(Math.random() * 1000);
    let editor = null;

    if (markers) {
        markers.subscribe((m) => {
            if (!editor) return;
            var model = editor.getModel();
            monaco.editor.setModelMarkers(model, "", m);
        });
    }
    
    const initEditor = () => {
        editor = monaco.editor.create(document.getElementById(id), {
            value: text || "",
            language: language,
            theme: theme,
            scrollBeyondLastLine: true,
            roundedSelection: true,
            fontSize: "16px",
            wordWrapColumn: 120,
            wordWrap: wordWrap ? "on" : "off",
            minimap: {
                enabled: false,
            },
            quickSuggestions: {
                other: false,
                comments: false,
                strings: false,
            },
        });
    }

    onMount(() => {
        initEditor();
    });
    onDestroy(() => {
        editor.dispose();
        editor = null;
    });
    
    $: if (text && editor) {
        editor.setValue(text);
    }
    
</script>


<div class="editor" {id} />



<style>
    .editor {
        height: 500px;
        width: 500px;
    }
</style>