<script>
    import { onMount, onDestroy } from "svelte";
    import { writable } from "svelte/store";
    import eventbus from "../services/eventbus";
    
    export let text = "";
    export let language = "carlang";
    export let theme = "carlangTheme";
    export let wordWrap = true;
    export let markers = writable([]);
    
    let editorContainer;
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
                enabled: true,
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
        var ro = new ResizeObserver(() => {
            editor?.layout();
        });
        ro.observe(editorContainer);
    });
    onDestroy(() => {
        editor.dispose();
        editor = null;
    });
    
    $: if (text && editor) {
        editor.setValue(text);
    }

    eventbus.subscribe(eventbus.EVENTS.SAVE, () => {
        if (editor._focusTracker._hasFocus) {
            eventbus.broadcast(eventbus.EVENTS.SAVING, editor.getValue());
        }
    });
    
</script>


<div class="editor" {id} bind:this={editorContainer} />



<style>
    .editor {
        height: 100%;
        width: 100%;
    }
</style>