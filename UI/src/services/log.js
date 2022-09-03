


import { writable, get as _get } from "svelte/store";

export const logState = writable([]);
export class LogEntry {
    constructor(message, type) {
        this.message = message;
        this.type = type;
    }
}

export const log = (message, type) => {
    logState.update((s) => {
        s.unshift(new LogEntry(message, type));
        return s;
    });
}