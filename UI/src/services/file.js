import eventbus from "./eventbus";
import { writable, get as _get } from "svelte/store";
import {httpGet, httpPut} from "./http";


// initialize the fileState. This object is 
// filled with the information of the current 
// file, like:
//  - namespace   :: The namespace of the module you are working on.
//  - directory   :: The base file path of the project.
//  - currentPath :: The full path name of the module you are working on.
//  - text        :: The full text of the file.
export const fileState = writable({
    directory: "",
    currentPath: "",
    text: "",
    namespace: ""
});

export function setFilePath(path) {
    const state = _get(fileState);
    
    if (path === state.currentPath) return;
    state.currentPath = path;
    // console.log("File selected: " + path);

    fetch('/page', {
        method: 'PUT',
        body: JSON.stringify({ 
            Path: path,
            BasePath: state.directory
        }),
        headers:{
            'Content-Type':'application/json'
        },
    })
        .then(response => response.json())
        .then(data => {
            localStorage.setItem("currentPath", path);
            updateState(data);
        })
        .catch(error => {
            state.currentPath = "";
            state.text = "";
            console.error('Error fetching data:', error);
            localStorage.removeItem("currentPath");
        });
}
export function updateState(data) {
    fileState.update(state => {
        Object.keys(data).forEach(key => {
            state[key] = data[key];
        });
        return state;
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
       
    try {
        // set the current project path
        let result = await httpGet(`/project/files/${encodeURIComponent(directory)}`);

        fileState.update(s => {
            s.files = result;
            s.currentPath = "";
            s.text = "";
            s.directory = directory;
            return s;
        });

        localStorage.setItem("directory", directory);
    }
    catch (error) {
        console.log(error);
    }
}

async function saveText(text) {
    const state = _get(fileState);
    let body = {
        path: state.currentPath,
        text,
        root: state.directory
    };
    
    // put the data
    var result = await httpPut('/file', body);
    
    // result is a list of errors in the compilation            
    setErrors(result);
    eventbus.broadcast(eventbus.EVENTS.ERRORS_RECEIVED, result);

    // update the state?
    setText(text);
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


export async function createNewModule(moduleName) {
    // create a new file on the server, a new module
    const state = _get(fileState);
    let body = {
        namespace: moduleName,
        basePath: state.directory
    };

    fetch('/sys/file', {
        method: 'PUT',
        headers:{
            'Content-Type':'application/json'
        },
        body: JSON.stringify(body)
    })
        .then(r => r.json())
        .then(r => {
            console.log(r);
        })
        .catch(console.log);
}