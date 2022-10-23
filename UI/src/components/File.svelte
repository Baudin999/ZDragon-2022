<script>
    import { fileState, setFilePath } from "../services/file";
    export let name;
    export let path;
    
    $: type = name.slice(name.lastIndexOf('.') + 1);
    $: selected = (path === $fileState.currentPath);
    
    const selectFile = () => {
        setFilePath(path);
    }
</script>

<div class="file-name-container" class:selected>
    <i class="fa fa-file-o"></i>
    <span on:click={selectFile}>{name}</span>
</div>

<style lang="less">
    @import "./../styles/colors";
    .file-name-container {
      white-space: nowrap;
      margin: 1px 3px 0 3px;
      
      transition: all 0.2s ease-in-out;
      
      &:hover {
        background: @sec-background;
      }

      &.selected {
        * {
          color: @accent-background;
          margin: 0.5rem 0;
        }
        &:hover {
          background: none;
        }
        font-size: 18px;
      }
    }
    
    span {
        background: 0 0.1em no-repeat;
        background-size: 1em 1em;
        cursor: pointer;
    }
</style>