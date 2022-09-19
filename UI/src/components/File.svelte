<script>
    import {fileState, setFilePath, deleteModule} from "../services/file";
    export let name;
    export let path;
    
    $: type = name.slice(name.lastIndexOf('.') + 1);
    $: selected = (path === $fileState.currentPath);
    
    const selectFile = () => {
        setFilePath(path);
    }
    const delModule = () => {
        deleteModule(path);
    }
</script>

<div>
    <span class:selected on:click={selectFile}>{name}</span>
    <span on:click={delModule}>DEL</span>
</div>

<style lang="less">
    @import "./../styles/colors";
    span {
        padding: 0 0 0 1.5em;
        background: 0 0.1em no-repeat;
        background-size: 1em 1em;
        cursor: pointer;
      
      &.selected {
        color: @accent-color;
        
      }
    }
</style>