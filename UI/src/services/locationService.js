
import { writable } from "svelte/store";

export const pathStore = writable(window.location.pathname); 

const init = () => {
    let previousUrl = "";

    const observer = new MutationObserver(() => {
        if (window.location.href !== previousUrl) {
            previousUrl = window.location.href;
            // do your thing
            
            pathStore.update(() => window.location.pathname);
        }
    });
    const config = { subtree: true, childList: true };

    // start observing change
    observer.observe(document, config);
};

export default init;
