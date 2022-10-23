<script>
    import Folder from "../components/Folder.svelte";
    import {fileState} from "../services/file";
    import { openModal } from 'svelte-modals'
    import CreateModule from './../modals/CreateModule.svelte';
    

    let root = [];
    fileState.subscribe(s => {
        root = s.files;
    });
    
    
    function handleCreateModule() {
        openModal(CreateModule, {});
    }
</script>

<div class="button-row">
    <button class="small no-border" on:click={handleCreateModule}><i class="fa fa-plus"></i></button>
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
    }
</style>