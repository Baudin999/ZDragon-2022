<script>
    import { closeModal } from 'svelte-modals'

    // provided by <Modals />
    export let isOpen
    
    // provided by the child
    export let title;
    export let showCancel = false;
    export let showOk = true;
    export let onOk;
    
    async function handleOk() {
        if (onOk) {
            let canContinue = onOk();
            if (canContinue) {
                closeModal();
            }
        }
        else {
            closeModal();
        }
    }

</script>

{#if isOpen}
    <div role="dialog" class="modal">
        <div class="contents">
            <h1 class="title">{title}</h1>
            <div class="content">
                <slot></slot>
            </div>
            <div class="actions">
                {#if showOk}
                    <button on:click={handleOk}>OK</button>
                {/if}

                {#if showCancel}
                    <button on:click={closeModal}>Cancel</button>
                {/if}
            </div>
        </div>
    </div>
{/if}

<style lang="less">
    @import "./../styles/colors";
    .modal {
        position: fixed;
        top: 0;
        bottom: 0;
        right: 0;
        left: 0;
        display: flex;
        justify-content: center;
        align-items: center;

        /* allow click-through to backdrop */
        pointer-events: none;
      
    }

    .contents {
        min-width: 526px;
        padding: 0;
        margin: 0;
        background: lighten(@primary-background, 10%);
        border-color: @primary-border;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        pointer-events: auto;
      .title {
        background: @sec-background;
        width: 100%;
        margin: 0;
        font-size: 1rem;
        text-transform: uppercase;
        padding: 0.5rem;
      }
      .content {
        padding: 1rem;        
      }
    }
      .actions {
        display: flex;
        justify-content: flex-end;
        padding: 1rem;
        button {
          margin-left: 1rem;
        }
      }

</style>