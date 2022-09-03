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
            localStorage.setItem("currentPath", path);
            setText(data);
        })
        .catch(error => {
            state.currentPath = "";
            state.text = "";
            console.error('Error fetching data:', error);
            localStorage.removeItem("currentPath");
        });
}

export function setText(text) {
    fileState.update(state => {
        state.text = text;
        return state;
    });
}

export function setDirectory(directory) {
    
    localStorage.setItem("directory", directory);

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
                s.files = r;
                return s;
            });
        });

}

export function init() {
    eventbus.subscribe(eventbus.EVENTS.SAVING, (data) => {
        console.log("Saving", data);
    });


    if (localStorage.getItem("directory")) {
        fileState.update(state => {
            state.directory = localStorage.getItem("directory");
            setDirectory(state.directory);
            
            if (localStorage.getItem("currentPath")) {
                OnFileSelected(localStorage.getItem("currentPath"));
            }
            return state;
        });
    }
    
}