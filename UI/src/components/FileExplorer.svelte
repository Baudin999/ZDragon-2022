<script>
    import Folder from "../components/Folder.svelte";
    import {fileState} from "../services/file";

    let root = [];
    fileState.subscribe(s => {
        root = s.files;
    });
</script>


<Folder name="Files" files={root} expanded={true}/>