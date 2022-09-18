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


<button on:click={handleCreateModule}>Create module</button>
<Folder name="Files" files={root} expanded={true}/>