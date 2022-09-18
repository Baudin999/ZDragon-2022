<script>
    import {createNewModule} from "../services/file";
    import BaseModal from "../components/BaseModal.svelte";
    let namespace = ""; 
    const createFile = async function() {
        
        await createNewModule(namespace);
        
        return false;
    }
</script>

<BaseModal {...$$props} title="Create Module" showCancel={true} onOk={createFile}>
    <div>You can create a module here.</div>
    <input bind:value={namespace} />
</BaseModal>


<style lang="less">
    input {
      width: 100%;
      margin-top: 1rem;
    }
</style>