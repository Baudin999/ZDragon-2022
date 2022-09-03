

import { writable, get as _get } from "svelte/store";

export const state = writable({
    code: "",
});

export const setCode = (code) => {
    // initialize code if it is null or undefined 
    if (!code) code = "";
    
    state.update((s) => {
        s.code = code;
        return s;
    });
}