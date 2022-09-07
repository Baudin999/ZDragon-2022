import eventbus from "./eventbus";
import { writable, get as _get } from "svelte/store";



export const fileState = writable({
    directory: "",
    currentPath: "",
    text: ""
});

export function setFilePath(path) {
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

export function setErrors(errors) {
    fileState.update(state => {
        state.errors = errors
        return state;
    })
}

export async function setDirectory(directory) {
    
    localStorage.setItem("directory", directory);

    // set the current project path
    let result = await fetch("/project", {
        method: 'PUT',
        headers:{
            'Content-Type':'application/json'
        },
        body: JSON.stringify({path: directory})
    });
    let obj = await result.json();
    
    fileState.update(s => {
        s.files = obj;
        s.currentPath = "";
        s.text = "";
        s.directory = directory;
        return s;
    });
    
}

function saveText(text) {
    const state = _get(fileState);
    
    fetch('/file', {
        method: 'PUT',
        headers:{
            'Content-Type':'application/json'
        },
        body: JSON.stringify({
            path: state.currentPath,
            text
        })
    })
        .then(r => r.json())
        .then(r => {
            // r is a list of errors in the compilation            
            setErrors(r);
            eventbus.broadcast(eventbus.EVENTS.ERRORS_RECEIVED, r);
            
            // update the state?
            setText(text);
        })
        .catch(console.log);
}

export async function init() {
    eventbus.subscribe(eventbus.EVENTS.SAVING, (data) => {
        // console.log("Saving", data);
        saveText(data);
    });
    
    if (localStorage.getItem("directory")) {
        await setDirectory(localStorage.getItem("directory"));
    }
    if (localStorage.getItem("currentPath")) {
        setFilePath(localStorage.getItem("currentPath"));
    }
    
}