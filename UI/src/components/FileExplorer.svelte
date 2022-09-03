<script>
    import Folder from "../components/Folder.svelte";
    
    let root = [];

    // set the current project path
    fetch("/project", {
            method: 'PUT',
            headers:{
                'Content-Type':'application/json'
            },
            body: JSON.stringify({path: "D:\\BasZDragon"})
        })
        .then(r => r.json())
        .then(r => {
            root = r;
        });

</script>


<Folder name="Files" files={root} expanded={true}/>