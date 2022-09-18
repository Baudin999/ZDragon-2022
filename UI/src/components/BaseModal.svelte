<script>
    import { closeModal } from 'svelte-modals'

    // provided by <Modals />
    export let isOpen

</script>

{#if isOpen}
    <div role="dialog" class="modal">
        <div class="contents">
            <slot></slot>
            <div class="actions">
                <button on:click={closeModal}>OK</button>
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
        min-width: 240px;
        padding: 16px;
        background: lighten(@primary-background, 10%);
        border-color: @primary-border;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        pointer-events: auto;
    }

    h2 {
        text-align: center;
        font-size: 24px;
    }

    p {
        text-align: center;
        margin-top: 16px;
    }

    .actions {
        margin-top: 32px;
        display: flex;
        justify-content: flex-end;
    }

</style>