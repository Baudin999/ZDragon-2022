

class eventbus {


    constructor() {
        this.handlers = {};
        //
    }

    subscribe(event, handler) {
        if (!(handler instanceof Function)) return;
        if (!this.handlers[event]) this.handlers[event] = [handler];
        else this.handlers[event].push(handler);
    }
    broadcast(event, data) {
        console.log("broadcasting: " + event);
        (this.handlers[event] || []).forEach(handler => {
            if (handler instanceof Function) {
                handler(data);
            }
        });
    }
    
    EVENTS = {
        SAVE: "save",
        SAVING: "saving",
        CTRL_P: "ctrl-p",
        COMMENT: "comment",
        START_REFACTOR: "start_refactor",
        JSON_SCHEMA: "json_schema"
    }

}

export default new eventbus();
