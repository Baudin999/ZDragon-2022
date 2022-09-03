<script>
    import { OnFileSelected } from "./../services/treeview-interactions";
    export let name;
    export let path;
    
    $: type = name.slice(name.lastIndexOf('.') + 1);
    
    const selectFile = () => {
        OnFileSelected(path);
    }
</script>

<span on:click={selectFile}>{name}</span>

<style>
    span {
        padding: 0 0 0 1.5em;
        background: 0 0.1em no-repeat;
        background-size: 1em 1em;
        cursor: pointer;
    }
</style>