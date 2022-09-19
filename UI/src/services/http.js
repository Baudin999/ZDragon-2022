
export const httpGet = function(url) {
    return new Promise(async (resolve, reject) => {
        try {
            let result = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            let obj = await result.json();
            resolve(obj);
        }
        catch (error) {
            reject(error);
        }
    });
}


export const httpPut = function(url, body) {
    return new Promise(async (resolve, reject) => {
        fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })
            .then(r => r.json())
            .then(r => {
                resolve(r);
            })
            .catch(reject);
    });
}

export const httpDelete = function(url, body) {
    return new Promise(async (resolve, reject) => {
        fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })
            .then(r => r.json())
            .then(r => {
                resolve(r);
            })
            .catch(reject);
    });
}