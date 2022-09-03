import {setCode} from "./code";

let currentPath = "";

export function OnFileSelected(path) {
    if (path === currentPath) return;
    currentPath = path;
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
            setCode(data);
        });
}