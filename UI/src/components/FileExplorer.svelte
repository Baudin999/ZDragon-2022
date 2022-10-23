<script>
    import Folder from "../components/Folder.svelte";
    import { fileState, deleteModule } from "../services/file";
    import { openModal } from 'svelte-modals'
    import CreateModule from './../modals/CreateModule.svelte';
    

    let root = [];
    let currentPath;
    fileState.subscribe(s => {
        root = s.files;
        currentPath = s.currentPath;
    });
    
    
    function handleCreateModule() {
        openModal(CreateModule, {});
    }
    function _deleteModule() {
        if (currentPath) {
            // console.log(currentPath);
            
            deleteModule(currentPath);
        }
    }
</script>

<div class="button-row">
    <button class="small no-border" on:click={handleCreateModule}><i class="fa fa-plus"></i></button>
    <button class="small no-border" on:click={_deleteModule}><i class="fa fa-trash"></i></button>
</div>

<div class="file-explorer">
<Folder name="Files" files={root} expanded={true}/>
</div>


<style>
    .button-row {
        display: flex;
        flex-direction: row;
    }
    
    .file-explorer {
        font-family: monospace;
        font-size: 15px;
    }
</style>