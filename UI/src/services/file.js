import eventbus from "./eventbus";
import { writable, get as _get } from "svelte/store";

export const fileState = writable({
    directory: "",
    currentPath: "",
    text: "",
    files: []
});


export function OnFileSelected(path) {
    const state = _get(fileState);
    
    if (path === state.currentPath) return;
    state.currentPath = path;
    console.log("File selected: " + path);

    fetch('/page', {
        method: 'PUT',
        body: JSON.stringify({ Path: path }),
        headers:{
            'Content-Type':'application/json'
        },
    })
        .then(response => response.text())
        .then(data => {
            setText(data);
        });
}

export function setText(text) {
    fileState.update(state => {
        state.text = text;
        return state;
    });
}

export function setDirectory(directory) {
    const state = _get(fileState);

    // set the current project path
    fetch("/project", {
        method: 'PUT',
        headers:{
            'Content-Type':'application/json'
        },
        body: JSON.stringify({path: directory})
    })
        .then(r => r.json())
        .then(r => {
            fileState.update(s => {
                return {
                    ...s,
                    files: r
                }
            });
        });

}

export function init() {
    eventbus.subscribe(eventbus.EVENTS.SAVING, (data) => {
        console.log("Saving", data);
    });
}