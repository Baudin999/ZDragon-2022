<script>
    import {fileState, setFilePath} from "../services/file";
    export let name;
    export let path;
    
    $: type = name.slice(name.lastIndexOf('.') + 1);
    $: selected = (path === $fileState.currentPath);
    
    const selectFile = () => {
        setFilePath(path);
    }
</script>

<span class:selected on:click={selectFile}>{name}</span>

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