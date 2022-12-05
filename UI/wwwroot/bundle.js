var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
        return context;
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }
    function update_await_block_branch(info, ctx, dirty) {
        const child_ctx = ctx.slice();
        const { resolved } = info;
        if (info.current === info.then) {
            child_ctx[info.value] = resolved;
        }
        if (info.current === info.catch) {
            child_ctx[info.error] = resolved;
        }
        info.block.p(child_ctx, dirty);
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init$3(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.49.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const LOCATION = {};
    const ROUTER = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    function getLocation(source) {
      return {
        ...source.location,
        state: source.history.state,
        key: (source.history.state && source.history.state.key) || "initial"
      };
    }

    function createHistory(source, options) {
      const listeners = [];
      let location = getLocation(source);

      return {
        get location() {
          return location;
        },

        listen(listener) {
          listeners.push(listener);

          const popstateListener = () => {
            location = getLocation(source);
            listener({ location, action: "POP" });
          };

          source.addEventListener("popstate", popstateListener);

          return () => {
            source.removeEventListener("popstate", popstateListener);

            const index = listeners.indexOf(listener);
            listeners.splice(index, 1);
          };
        },

        navigate(to, { state, replace = false } = {}) {
          state = { ...state, key: Date.now() + "" };
          // try...catch iOS Safari limits to 100 pushState calls
          try {
            if (replace) {
              source.history.replaceState(state, null, to);
            } else {
              source.history.pushState(state, null, to);
            }
          } catch (e) {
            source.location[replace ? "replace" : "assign"](to);
          }

          location = getLocation(source);
          listeners.forEach(listener => listener({ location, action: "PUSH" }));
        }
      };
    }

    // Stores history entries in memory for testing or other platforms like Native
    function createMemorySource(initialPathname = "/") {
      let index = 0;
      const stack = [{ pathname: initialPathname, search: "" }];
      const states = [];

      return {
        get location() {
          return stack[index];
        },
        addEventListener(name, fn) {},
        removeEventListener(name, fn) {},
        history: {
          get entries() {
            return stack;
          },
          get index() {
            return index;
          },
          get state() {
            return states[index];
          },
          pushState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            index++;
            stack.push({ pathname, search });
            states.push(state);
          },
          replaceState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            stack[index] = { pathname, search };
            states[index] = state;
          }
        }
      };
    }

    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const canUseDOM = Boolean(
      typeof window !== "undefined" &&
        window.document &&
        window.document.createElement
    );
    const globalHistory = createHistory(canUseDOM ? window : createMemorySource());
    const { navigate } = globalHistory;

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    const paramRe = /^:(.+)/;

    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Check if `string` starts with `search`
     * @param {string} string
     * @param {string} search
     * @return {boolean}
     */
    function startsWith(string, search) {
      return string.substr(0, search.length) === search;
    }

    /**
     * Check if `segment` is a root segment
     * @param {string} segment
     * @return {boolean}
     */
    function isRootSegment(segment) {
      return segment === "";
    }

    /**
     * Check if `segment` is a dynamic segment
     * @param {string} segment
     * @return {boolean}
     */
    function isDynamic(segment) {
      return paramRe.test(segment);
    }

    /**
     * Check if `segment` is a splat
     * @param {string} segment
     * @return {boolean}
     */
    function isSplat(segment) {
      return segment[0] === "*";
    }

    /**
     * Split up the URI into segments delimited by `/`
     * @param {string} uri
     * @return {string[]}
     */
    function segmentize(uri) {
      return (
        uri
          // Strip starting/ending `/`
          .replace(/(^\/+|\/+$)/g, "")
          .split("/")
      );
    }

    /**
     * Strip `str` of potential start and end `/`
     * @param {string} str
     * @return {string}
     */
    function stripSlashes(str) {
      return str.replace(/(^\/+|\/+$)/g, "");
    }

    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    function rankRoute(route, index) {
      const score = route.default
        ? 0
        : segmentize(route.path).reduce((score, segment) => {
            score += SEGMENT_POINTS;

            if (isRootSegment(segment)) {
              score += ROOT_POINTS;
            } else if (isDynamic(segment)) {
              score += DYNAMIC_POINTS;
            } else if (isSplat(segment)) {
              score -= SEGMENT_POINTS + SPLAT_PENALTY;
            } else {
              score += STATIC_POINTS;
            }

            return score;
          }, 0);

      return { route, score, index };
    }

    /**
     * Give a score to all routes and sort them on that
     * @param {object[]} routes
     * @return {object[]}
     */
    function rankRoutes(routes) {
      return (
        routes
          .map(rankRoute)
          // If two routes have the exact same score, we go by index instead
          .sort((a, b) =>
            a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
          )
      );
    }

    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    function pick(routes, uri) {
      let match;
      let default_;

      const [uriPathname] = uri.split("?");
      const uriSegments = segmentize(uriPathname);
      const isRootUri = uriSegments[0] === "";
      const ranked = rankRoutes(routes);

      for (let i = 0, l = ranked.length; i < l; i++) {
        const route = ranked[i].route;
        let missed = false;

        if (route.default) {
          default_ = {
            route,
            params: {},
            uri
          };
          continue;
        }

        const routeSegments = segmentize(route.path);
        const params = {};
        const max = Math.max(uriSegments.length, routeSegments.length);
        let index = 0;

        for (; index < max; index++) {
          const routeSegment = routeSegments[index];
          const uriSegment = uriSegments[index];

          if (routeSegment !== undefined && isSplat(routeSegment)) {
            // Hit a splat, just grab the rest, and return a match
            // uri:   /files/documents/work
            // route: /files/* or /files/*splatname
            const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

            params[splatName] = uriSegments
              .slice(index)
              .map(decodeURIComponent)
              .join("/");
            break;
          }

          if (uriSegment === undefined) {
            // URI is shorter than the route, no match
            // uri:   /users
            // route: /users/:userId
            missed = true;
            break;
          }

          let dynamicMatch = paramRe.exec(routeSegment);

          if (dynamicMatch && !isRootUri) {
            const value = decodeURIComponent(uriSegment);
            params[dynamicMatch[1]] = value;
          } else if (routeSegment !== uriSegment) {
            // Current segments don't match, not dynamic, not splat, so no match
            // uri:   /users/123/settings
            // route: /users/:id/profile
            missed = true;
            break;
          }
        }

        if (!missed) {
          match = {
            route,
            params,
            uri: "/" + uriSegments.slice(0, index).join("/")
          };
          break;
        }
      }

      return match || default_ || null;
    }

    /**
     * Check if the `path` matches the `uri`.
     * @param {string} path
     * @param {string} uri
     * @return {?object}
     */
    function match(route, uri) {
      return pick([route], uri);
    }

    /**
     * Add the query to the pathname if a query is given
     * @param {string} pathname
     * @param {string} [query]
     * @return {string}
     */
    function addQuery(pathname, query) {
      return pathname + (query ? `?${query}` : "");
    }

    /**
     * Resolve URIs as though every path is a directory, no files. Relative URIs
     * in the browser can feel awkward because not only can you be "in a directory",
     * you can be "at a file", too. For example:
     *
     *  browserSpecResolve('foo', '/bar/') => /bar/foo
     *  browserSpecResolve('foo', '/bar') => /foo
     *
     * But on the command line of a file system, it's not as complicated. You can't
     * `cd` from a file, only directories. This way, links have to know less about
     * their current path. To go deeper you can do this:
     *
     *  <Link to="deeper"/>
     *  // instead of
     *  <Link to=`{${props.uri}/deeper}`/>
     *
     * Just like `cd`, if you want to go deeper from the command line, you do this:
     *
     *  cd deeper
     *  # not
     *  cd $(pwd)/deeper
     *
     * By treating every path as a directory, linking to relative paths should
     * require less contextual information and (fingers crossed) be more intuitive.
     * @param {string} to
     * @param {string} base
     * @return {string}
     */
    function resolve(to, base) {
      // /foo/bar, /baz/qux => /foo/bar
      if (startsWith(to, "/")) {
        return to;
      }

      const [toPathname, toQuery] = to.split("?");
      const [basePathname] = base.split("?");
      const toSegments = segmentize(toPathname);
      const baseSegments = segmentize(basePathname);

      // ?a=b, /users?b=c => /users?a=b
      if (toSegments[0] === "") {
        return addQuery(basePathname, toQuery);
      }

      // profile, /users/789 => /users/789/profile
      if (!startsWith(toSegments[0], ".")) {
        const pathname = baseSegments.concat(toSegments).join("/");

        return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
      }

      // ./       , /users/123 => /users/123
      // ../      , /users/123 => /users
      // ../..    , /users/123 => /
      // ../../one, /a/b/c/d   => /a/b/one
      // .././one , /a/b/c/d   => /a/b/c/one
      const allSegments = baseSegments.concat(toSegments);
      const segments = [];

      allSegments.forEach(segment => {
        if (segment === "..") {
          segments.pop();
        } else if (segment !== ".") {
          segments.push(segment);
        }
      });

      return addQuery("/" + segments.join("/"), toQuery);
    }

    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    function combinePaths(basepath, path) {
      return `${stripSlashes(
    path === "/" ? basepath : `${stripSlashes(basepath)}/${stripSlashes(path)}`
  )}/`;
    }

    /**
     * Decides whether a given `event` should result in a navigation or not.
     * @param {object} event
     */
    function shouldNavigate(event) {
      return (
        !event.defaultPrevented &&
        event.button === 0 &&
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
      );
    }

    /* node_modules\svelte-routing\src\Router.svelte generated by Svelte v3.49.0 */

    function create_fragment$j(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 256)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[8],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[8], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let $location;
    	let $routes;
    	let $base;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Router', slots, ['default']);
    	let { basepath = "/" } = $$props;
    	let { url = null } = $$props;
    	const locationContext = getContext(LOCATION);
    	const routerContext = getContext(ROUTER);
    	const routes = writable([]);
    	validate_store(routes, 'routes');
    	component_subscribe($$self, routes, value => $$invalidate(6, $routes = value));
    	const activeRoute = writable(null);
    	let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

    	// If locationContext is not set, this is the topmost Router in the tree.
    	// If the `url` prop is given we force the location to it.
    	const location = locationContext || writable(url ? { pathname: url } : globalHistory.location);

    	validate_store(location, 'location');
    	component_subscribe($$self, location, value => $$invalidate(5, $location = value));

    	// If routerContext is set, the routerBase of the parent Router
    	// will be the base for this Router's descendants.
    	// If routerContext is not set, the path and resolved uri will both
    	// have the value of the basepath prop.
    	const base = routerContext
    	? routerContext.routerBase
    	: writable({ path: basepath, uri: basepath });

    	validate_store(base, 'base');
    	component_subscribe($$self, base, value => $$invalidate(7, $base = value));

    	const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
    		// If there is no activeRoute, the routerBase will be identical to the base.
    		if (activeRoute === null) {
    			return base;
    		}

    		const { path: basepath } = base;
    		const { route, uri } = activeRoute;

    		// Remove the potential /* or /*splatname from
    		// the end of the child Routes relative paths.
    		const path = route.default
    		? basepath
    		: route.path.replace(/\*.*$/, "");

    		return { path, uri };
    	});

    	function registerRoute(route) {
    		const { path: basepath } = $base;
    		let { path } = route;

    		// We store the original path in the _path property so we can reuse
    		// it when the basepath changes. The only thing that matters is that
    		// the route reference is intact, so mutation is fine.
    		route._path = path;

    		route.path = combinePaths(basepath, path);

    		if (typeof window === "undefined") {
    			// In SSR we should set the activeRoute immediately if it is a match.
    			// If there are more Routes being registered after a match is found,
    			// we just skip them.
    			if (hasActiveRoute) {
    				return;
    			}

    			const matchingRoute = match(route, $location.pathname);

    			if (matchingRoute) {
    				activeRoute.set(matchingRoute);
    				hasActiveRoute = true;
    			}
    		} else {
    			routes.update(rs => {
    				rs.push(route);
    				return rs;
    			});
    		}
    	}

    	function unregisterRoute(route) {
    		routes.update(rs => {
    			const index = rs.indexOf(route);
    			rs.splice(index, 1);
    			return rs;
    		});
    	}

    	if (!locationContext) {
    		// The topmost Router in the tree is responsible for updating
    		// the location store and supplying it through context.
    		onMount(() => {
    			const unlisten = globalHistory.listen(history => {
    				location.set(history.location);
    			});

    			return unlisten;
    		});

    		setContext(LOCATION, location);
    	}

    	setContext(ROUTER, {
    		activeRoute,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute
    	});

    	const writable_props = ['basepath', 'url'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('basepath' in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ('url' in $$props) $$invalidate(4, url = $$props.url);
    		if ('$$scope' in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		onMount,
    		writable,
    		derived,
    		LOCATION,
    		ROUTER,
    		globalHistory,
    		pick,
    		match,
    		stripSlashes,
    		combinePaths,
    		basepath,
    		url,
    		locationContext,
    		routerContext,
    		routes,
    		activeRoute,
    		hasActiveRoute,
    		location,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute,
    		$location,
    		$routes,
    		$base
    	});

    	$$self.$inject_state = $$props => {
    		if ('basepath' in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ('url' in $$props) $$invalidate(4, url = $$props.url);
    		if ('hasActiveRoute' in $$props) hasActiveRoute = $$props.hasActiveRoute;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$base*/ 128) {
    			// This reactive statement will update all the Routes' path when
    			// the basepath changes.
    			{
    				const { path: basepath } = $base;

    				routes.update(rs => {
    					rs.forEach(r => r.path = combinePaths(basepath, r._path));
    					return rs;
    				});
    			}
    		}

    		if ($$self.$$.dirty & /*$routes, $location*/ 96) {
    			// This reactive statement will be run when the Router is created
    			// when there are no Routes and then again the following tick, so it
    			// will not find an active Route in SSR and in the browser it will only
    			// pick an active Route after all Routes have been registered.
    			{
    				const bestMatch = pick($routes, $location.pathname);
    				activeRoute.set(bestMatch);
    			}
    		}
    	};

    	return [
    		routes,
    		location,
    		base,
    		basepath,
    		url,
    		$location,
    		$routes,
    		$base,
    		$$scope,
    		slots
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$3(this, options, instance$j, create_fragment$j, safe_not_equal, { basepath: 3, url: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$j.name
    		});
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-routing\src\Route.svelte generated by Svelte v3.49.0 */

    const get_default_slot_changes = dirty => ({
    	params: dirty & /*routeParams*/ 4,
    	location: dirty & /*$location*/ 16
    });

    const get_default_slot_context = ctx => ({
    	params: /*routeParams*/ ctx[2],
    	location: /*$location*/ ctx[4]
    });

    // (40:0) {#if $activeRoute !== null && $activeRoute.route === route}
    function create_if_block$5(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$4, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0] !== null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(40:0) {#if $activeRoute !== null && $activeRoute.route === route}",
    		ctx
    	});

    	return block;
    }

    // (43:2) {:else}
    function create_else_block$3(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, routeParams, $location*/ 532)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[9],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[9])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[9], dirty, get_default_slot_changes),
    						get_default_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(43:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (41:2) {#if component !== null}
    function create_if_block_1$4(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ location: /*$location*/ ctx[4] },
    		/*routeParams*/ ctx[2],
    		/*routeProps*/ ctx[3]
    	];

    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*$location, routeParams, routeProps*/ 28)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*$location*/ 16 && { location: /*$location*/ ctx[4] },
    					dirty & /*routeParams*/ 4 && get_spread_object(/*routeParams*/ ctx[2]),
    					dirty & /*routeProps*/ 8 && get_spread_object(/*routeProps*/ ctx[3])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(41:2) {#if component !== null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[1] !== null && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[7] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$activeRoute*/ ctx[1] !== null && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$activeRoute*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let $activeRoute;
    	let $location;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Route', slots, ['default']);
    	let { path = "" } = $$props;
    	let { component = null } = $$props;
    	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
    	validate_store(activeRoute, 'activeRoute');
    	component_subscribe($$self, activeRoute, value => $$invalidate(1, $activeRoute = value));
    	const location = getContext(LOCATION);
    	validate_store(location, 'location');
    	component_subscribe($$self, location, value => $$invalidate(4, $location = value));

    	const route = {
    		path,
    		// If no path prop is given, this Route will act as the default Route
    		// that is rendered if no other Route in the Router is a match.
    		default: path === ""
    	};

    	let routeParams = {};
    	let routeProps = {};
    	registerRoute(route);

    	// There is no need to unregister Routes in SSR since it will all be
    	// thrown away anyway.
    	if (typeof window !== "undefined") {
    		onDestroy(() => {
    			unregisterRoute(route);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('path' in $$new_props) $$invalidate(8, path = $$new_props.path);
    		if ('component' in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ('$$scope' in $$new_props) $$invalidate(9, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onDestroy,
    		ROUTER,
    		LOCATION,
    		path,
    		component,
    		registerRoute,
    		unregisterRoute,
    		activeRoute,
    		location,
    		route,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$location
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), $$new_props));
    		if ('path' in $$props) $$invalidate(8, path = $$new_props.path);
    		if ('component' in $$props) $$invalidate(0, component = $$new_props.component);
    		if ('routeParams' in $$props) $$invalidate(2, routeParams = $$new_props.routeParams);
    		if ('routeProps' in $$props) $$invalidate(3, routeProps = $$new_props.routeProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$activeRoute*/ 2) {
    			if ($activeRoute && $activeRoute.route === route) {
    				$$invalidate(2, routeParams = $activeRoute.params);
    			}
    		}

    		{
    			const { path, component, ...rest } = $$props;
    			$$invalidate(3, routeProps = rest);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		$activeRoute,
    		routeParams,
    		routeProps,
    		$location,
    		activeRoute,
    		location,
    		route,
    		path,
    		$$scope,
    		slots
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$3(this, options, instance$i, create_fragment$i, safe_not_equal, { path: 8, component: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$i.name
    		});
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-routing\src\Link.svelte generated by Svelte v3.49.0 */
    const file$g = "node_modules\\svelte-routing\\src\\Link.svelte";

    function create_fragment$h(ctx) {
    	let a;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[16].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[15], null);

    	let a_levels = [
    		{ href: /*href*/ ctx[0] },
    		{ "aria-current": /*ariaCurrent*/ ctx[2] },
    		/*props*/ ctx[1],
    		/*$$restProps*/ ctx[6]
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			set_attributes(a, a_data);
    			add_location(a, file$g, 40, 0, 1249);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*onClick*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32768)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[15],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[15])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[15], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				(!current || dirty & /*href*/ 1) && { href: /*href*/ ctx[0] },
    				(!current || dirty & /*ariaCurrent*/ 4) && { "aria-current": /*ariaCurrent*/ ctx[2] },
    				dirty & /*props*/ 2 && /*props*/ ctx[1],
    				dirty & /*$$restProps*/ 64 && /*$$restProps*/ ctx[6]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let ariaCurrent;
    	const omit_props_names = ["to","replace","state","getProps"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $location;
    	let $base;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Link', slots, ['default']);
    	let { to = "#" } = $$props;
    	let { replace = false } = $$props;
    	let { state = {} } = $$props;
    	let { getProps = () => ({}) } = $$props;
    	const { base } = getContext(ROUTER);
    	validate_store(base, 'base');
    	component_subscribe($$self, base, value => $$invalidate(14, $base = value));
    	const location = getContext(LOCATION);
    	validate_store(location, 'location');
    	component_subscribe($$self, location, value => $$invalidate(13, $location = value));
    	const dispatch = createEventDispatcher();
    	let href, isPartiallyCurrent, isCurrent, props;

    	function onClick(event) {
    		dispatch("click", event);

    		if (shouldNavigate(event)) {
    			event.preventDefault();

    			// Don't push another entry to the history stack when the user
    			// clicks on a Link to the page they are currently on.
    			const shouldReplace = $location.pathname === href || replace;

    			navigate(href, { state, replace: shouldReplace });
    		}
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(6, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('to' in $$new_props) $$invalidate(7, to = $$new_props.to);
    		if ('replace' in $$new_props) $$invalidate(8, replace = $$new_props.replace);
    		if ('state' in $$new_props) $$invalidate(9, state = $$new_props.state);
    		if ('getProps' in $$new_props) $$invalidate(10, getProps = $$new_props.getProps);
    		if ('$$scope' in $$new_props) $$invalidate(15, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		createEventDispatcher,
    		ROUTER,
    		LOCATION,
    		navigate,
    		startsWith,
    		resolve,
    		shouldNavigate,
    		to,
    		replace,
    		state,
    		getProps,
    		base,
    		location,
    		dispatch,
    		href,
    		isPartiallyCurrent,
    		isCurrent,
    		props,
    		onClick,
    		ariaCurrent,
    		$location,
    		$base
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('to' in $$props) $$invalidate(7, to = $$new_props.to);
    		if ('replace' in $$props) $$invalidate(8, replace = $$new_props.replace);
    		if ('state' in $$props) $$invalidate(9, state = $$new_props.state);
    		if ('getProps' in $$props) $$invalidate(10, getProps = $$new_props.getProps);
    		if ('href' in $$props) $$invalidate(0, href = $$new_props.href);
    		if ('isPartiallyCurrent' in $$props) $$invalidate(11, isPartiallyCurrent = $$new_props.isPartiallyCurrent);
    		if ('isCurrent' in $$props) $$invalidate(12, isCurrent = $$new_props.isCurrent);
    		if ('props' in $$props) $$invalidate(1, props = $$new_props.props);
    		if ('ariaCurrent' in $$props) $$invalidate(2, ariaCurrent = $$new_props.ariaCurrent);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*to, $base*/ 16512) {
    			$$invalidate(0, href = to === "/" ? $base.uri : resolve(to, $base.uri));
    		}

    		if ($$self.$$.dirty & /*$location, href*/ 8193) {
    			$$invalidate(11, isPartiallyCurrent = startsWith($location.pathname, href));
    		}

    		if ($$self.$$.dirty & /*href, $location*/ 8193) {
    			$$invalidate(12, isCurrent = href === $location.pathname);
    		}

    		if ($$self.$$.dirty & /*isCurrent*/ 4096) {
    			$$invalidate(2, ariaCurrent = isCurrent ? "page" : undefined);
    		}

    		if ($$self.$$.dirty & /*getProps, $location, href, isPartiallyCurrent, isCurrent*/ 15361) {
    			$$invalidate(1, props = getProps({
    				location: $location,
    				href,
    				isPartiallyCurrent,
    				isCurrent
    			}));
    		}
    	};

    	return [
    		href,
    		props,
    		ariaCurrent,
    		base,
    		location,
    		onClick,
    		$$restProps,
    		to,
    		replace,
    		state,
    		getProps,
    		isPartiallyCurrent,
    		isCurrent,
    		$location,
    		$base,
    		$$scope,
    		slots
    	];
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init$3(this, options, instance$h, create_fragment$h, safe_not_equal, {
    			to: 7,
    			replace: 8,
    			state: 9,
    			getProps: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$h.name
    		});
    	}

    	get to() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get state() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getProps() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getProps(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

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
            // console.log("broadcasting: " + event);
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
            JSON_SCHEMA: "json_schema",
            ERRORS_RECEIVED: "errors_received",
            SAVE_COMPLETED: "save_completed"
        }

    }

    var eventbus$1 = new eventbus();

    const httpGet = function(url) {
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
    };


    const httpPut = function(url, body) {
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
    };

    const httpDelete = function(url, body) {
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
    };

    // initialize the fileState. This object is 
    // filled with the information of the current 
    // file, like:
    //  - namespace   :: The namespace of the module you are working on.
    //  - directory   :: The base file path of the project.
    //  - currentPath :: The full path name of the module you are working on.
    //  - text        :: The full text of the file.
    const fileState = writable({
        directory: "",
        currentPath: "",
        text: "",
        namespace: ""
    });

    async function setFilePath(path) {
        const state = get_store_value(fileState);
        
        if (path === state.currentPath) return;
        state.currentPath = path;
        
        let body = {
            Path: path,
            BasePath: state.directory
        };
        try {
            var data = await httpPut('/page', body);
            localStorage.setItem("currentPath", path);
            updateState(data);
        }
        catch(error) {
            state.currentPath = "";
            state.text = "";
            console.error('Error fetching data:', error);
            localStorage.removeItem("currentPath");
        }
    }
    function updateState(data) {
        fileState.update(state => {
            Object.keys(data).forEach(key => {
                state[key] = data[key];
            });
            return state;
        });
    }
    function setText(text) {
        fileState.update(state => {
            state.text = text;
            return state;
        });
    }

    function setErrors(errors) {
        fileState.update(state => {
            state.errors = errors;
            return state;
        });
    }

    async function setDirectory(directory) {
           
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
        const state = get_store_value(fileState);
        let body = {
            path: state.currentPath,
            text,
            basePath: state.directory
        };
        
        // put the data
        var result = await httpPut('/file', body);
        
        // result is a list of errors in the compilation            
        setErrors(result);
        eventbus$1.broadcast(eventbus$1.EVENTS.ERRORS_RECEIVED, result);
        eventbus$1.broadcast(eventbus$1.EVENTS.SAVE_COMPLETED);

        // update the state?
        setText(text);
    }

    async function init$2() {
        eventbus$1.subscribe(eventbus$1.EVENTS.SAVING, (data) => {
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


    async function createNewModule(moduleName) {
        // create a new file on the server, a new module
        const state = get_store_value(fileState);
        let body = {
            namespace: moduleName,
            basePath: state.directory
        };
        
        try {
            var result = await httpPut('/module', body);
            fileState.update(state => {
                state.namespace = result.ns;
                state.currentPath = result.fullName;
                state.text = "";
                state.files = result.files;
                state.errors = [];

                return state;
            });
        }
        catch (error) {
            console.log(error);        
        }

    }

    async function deleteModule(modulePath) {
        // create a new file on the server, a new module
        const state = get_store_value(fileState);
        let body = {
            fileName: modulePath,
            basePath: state.directory
        };

        try {
            var result = await httpDelete('/module', body);
            fileState.update(state => {
                state.namespace = "";
                state.currentPath = "";
                state.text = "";
                state.files = result.files;
                state.errors = [];

                return state;
            });
        }
        catch (error) {
            console.log(error);
        }

    }

    /* src\pages\home.svelte generated by Svelte v3.49.0 */
    const file$f = "src\\pages\\home.svelte";

    function create_fragment$g(ctx) {
    	let t0;
    	let div;
    	let t1;
    	let input;
    	let t2;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			t0 = space();
    			div = element("div");
    			t1 = text("Home\r\n\t\r\n\t\t");
    			input = element("input");
    			t2 = space();
    			button = element("button");
    			button.textContent = "Submit";
    			attr_dev(input, "class", "svelte-ruxzka");
    			add_location(input, file$f, 19, 2, 287);
    			add_location(button, file$f, 20, 2, 318);
    			add_location(div, file$f, 16, 0, 268);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, t1);
    			append_dev(div, input);
    			set_input_value(input, /*path*/ ctx[0]);
    			append_dev(div, t2);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[2]),
    					listen_dev(button, "click", /*submitPath*/ ctx[1], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*path*/ 1 && input.value !== /*path*/ ctx[0]) {
    				set_input_value(input, /*path*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Home', slots, []);
    	let path = "";

    	const submitPath = () => {
    		setDirectory(path);
    	};

    	fileState.subscribe(state => {
    		if (state.directory) {
    			$$invalidate(0, path = state.directory);
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		path = this.value;
    		$$invalidate(0, path);
    	}

    	$$self.$capture_state = () => ({
    		fileState,
    		setDirectory,
    		path,
    		submitPath
    	});

    	$$self.$inject_state = $$props => {
    		if ('path' in $$props) $$invalidate(0, path = $$props.path);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [path, submitPath, input_input_handler];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$3(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src\pages\about.svelte generated by Svelte v3.49.0 */

    const file$e = "src\\pages\\about.svelte";

    function create_fragment$f(ctx) {
    	let t0;
    	let div;

    	const block = {
    		c: function create() {
    			t0 = space();
    			div = element("div");
    			div.textContent = "About";
    			add_location(div, file$e, 4, 0, 54);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('About', slots, []);
    	const location = "";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ location });
    	return [location];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$3(this, options, instance$f, create_fragment$f, safe_not_equal, { location: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get location() {
    		return this.$$.ctx[0];
    	}

    	set location(value) {
    		throw new Error("<About>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Editor.svelte generated by Svelte v3.49.0 */
    const file$d = "src\\components\\Editor.svelte";

    function create_fragment$e(ctx) {
    	let t;
    	let div;

    	const block = {
    		c: function create() {
    			t = space();
    			div = element("div");
    			attr_dev(div, "class", "editor svelte-b3bzf");
    			attr_dev(div, "id", /*id*/ ctx[1]);
    			add_location(div, file$d, 106, 0, 3103);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);
    			/*div_binding*/ ctx[8](div);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[8](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Editor', slots, []);
    	let monaco = window.monaco;
    	let { text = "" } = $$props;
    	let { language = "carlang" } = $$props;
    	let { theme = "carlangTheme" } = $$props;
    	let { wordWrap = true } = $$props;
    	let { markers = writable([]) } = $$props;
    	let editorContainer;
    	let id = "editor-" + Math.floor(Math.random() * 1000);
    	let editor = null;

    	if (markers) {
    		markers.subscribe(m => {
    			if (!editor) return;
    			var model = editor.getModel();
    			monaco.editor.setModelMarkers(model, "", m);
    		});
    	}

    	const initEditor = () => {
    		$$invalidate(7, editor = monaco.editor.create(document.getElementById(id), {
    			value: text || "",
    			language,
    			theme,
    			scrollBeyondLastLine: true,
    			roundedSelection: true,
    			fontSize: "16px",
    			wordWrapColumn: 120,
    			wordWrap: wordWrap ? "on" : "off",
    			minimap: { enabled: true },
    			quickSuggestions: {
    				other: false,
    				comments: false,
    				strings: false
    			}
    		}));
    	};

    	onMount(() => {
    		initEditor();

    		var ro = new ResizeObserver(() => {
    				editor?.layout();
    			});

    		ro.observe(editorContainer);
    	});

    	onDestroy(() => {
    		editor.dispose();
    		$$invalidate(7, editor = null);
    	});

    	eventbus$1.subscribe(eventbus$1.EVENTS.SAVE, () => {
    		if (editor && editor._focusTracker._hasFocus) {
    			eventbus$1.broadcast(eventbus$1.EVENTS.SAVING, editor.getValue());
    		}
    	});

    	eventbus$1.subscribe(eventbus$1.EVENTS.ERRORS_RECEIVED, errors => {
    		if (!editor || !errors) return;
    		var model = editor.getModel();

    		var markers = errors.map(e => {
    			return {
    				message: e.message,
    				startLineNumber: e.source.startLine + 1,
    				endLineNumber: e.source.endLine,
    				startColumn: e.source.startColumn + 1,
    				endColumn: e.source.endColumn + 1,
    				severity: 'error'
    			};
    		});

    		monaco.editor.setModelMarkers(model, "", markers);
    	});

    	const writable_props = ['text', 'language', 'theme', 'wordWrap', 'markers'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Editor> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			editorContainer = $$value;
    			$$invalidate(0, editorContainer);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('text' in $$props) $$invalidate(2, text = $$props.text);
    		if ('language' in $$props) $$invalidate(3, language = $$props.language);
    		if ('theme' in $$props) $$invalidate(4, theme = $$props.theme);
    		if ('wordWrap' in $$props) $$invalidate(5, wordWrap = $$props.wordWrap);
    		if ('markers' in $$props) $$invalidate(6, markers = $$props.markers);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		writable,
    		eventbus: eventbus$1,
    		monaco,
    		text,
    		language,
    		theme,
    		wordWrap,
    		markers,
    		editorContainer,
    		id,
    		editor,
    		initEditor
    	});

    	$$self.$inject_state = $$props => {
    		if ('monaco' in $$props) monaco = $$props.monaco;
    		if ('text' in $$props) $$invalidate(2, text = $$props.text);
    		if ('language' in $$props) $$invalidate(3, language = $$props.language);
    		if ('theme' in $$props) $$invalidate(4, theme = $$props.theme);
    		if ('wordWrap' in $$props) $$invalidate(5, wordWrap = $$props.wordWrap);
    		if ('markers' in $$props) $$invalidate(6, markers = $$props.markers);
    		if ('editorContainer' in $$props) $$invalidate(0, editorContainer = $$props.editorContainer);
    		if ('id' in $$props) $$invalidate(1, id = $$props.id);
    		if ('editor' in $$props) $$invalidate(7, editor = $$props.editor);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*text, editor*/ 132) {
    			if (text !== undefined && text !== null && editor) {
    				// editor.setValue(text);
    				const model = editor.getModel();

    				const position = editor.getPosition();

    				if (text != null && text !== model.getValue()) {
    					editor.pushUndoStop();
    					model.pushEditOperations([], [{ range: model.getFullModelRange(), text }]);
    					editor.pushUndoStop();
    					editor.setPosition(position);
    				}
    			}
    		}
    	};

    	return [
    		editorContainer,
    		id,
    		text,
    		language,
    		theme,
    		wordWrap,
    		markers,
    		editor,
    		div_binding
    	];
    }

    class Editor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init$3(this, options, instance$e, create_fragment$e, safe_not_equal, {
    			text: 2,
    			language: 3,
    			theme: 4,
    			wordWrap: 5,
    			markers: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Editor",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get text() {
    		throw new Error("<Editor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Editor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get language() {
    		throw new Error("<Editor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set language(value) {
    		throw new Error("<Editor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get theme() {
    		throw new Error("<Editor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<Editor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get wordWrap() {
    		throw new Error("<Editor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set wordWrap(value) {
    		throw new Error("<Editor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get markers() {
    		throw new Error("<Editor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set markers(value) {
    		throw new Error("<Editor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\File.svelte generated by Svelte v3.49.0 */
    const file$c = "src\\components\\File.svelte";

    function create_fragment$d(ctx) {
    	let t0;
    	let div;
    	let i;
    	let t1;
    	let span;
    	let t2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			t0 = space();
    			div = element("div");
    			i = element("i");
    			t1 = space();
    			span = element("span");
    			t2 = text(/*name*/ ctx[0]);
    			attr_dev(i, "class", "fa fa-file-o svelte-19re4u5");
    			add_location(i, file$c, 14, 4, 373);
    			attr_dev(span, "class", "svelte-19re4u5");
    			add_location(span, file$c, 15, 4, 407);
    			attr_dev(div, "class", "file-name-container svelte-19re4u5");
    			toggle_class(div, "selected", /*selected*/ ctx[1]);
    			add_location(div, file$c, 13, 0, 319);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, i);
    			append_dev(div, t1);
    			append_dev(div, span);
    			append_dev(span, t2);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*selectFile*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1) set_data_dev(t2, /*name*/ ctx[0]);

    			if (dirty & /*selected*/ 2) {
    				toggle_class(div, "selected", /*selected*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let type;
    	let selected;
    	let $fileState;
    	validate_store(fileState, 'fileState');
    	component_subscribe($$self, fileState, $$value => $$invalidate(4, $fileState = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('File', slots, []);
    	let { name } = $$props;
    	let { path } = $$props;

    	const selectFile = () => {
    		setFilePath(path);
    	};

    	const writable_props = ['name', 'path'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<File> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('path' in $$props) $$invalidate(3, path = $$props.path);
    	};

    	$$self.$capture_state = () => ({
    		fileState,
    		setFilePath,
    		name,
    		path,
    		selectFile,
    		selected,
    		type,
    		$fileState
    	});

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('path' in $$props) $$invalidate(3, path = $$props.path);
    		if ('selected' in $$props) $$invalidate(1, selected = $$props.selected);
    		if ('type' in $$props) type = $$props.type;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*name*/ 1) {
    			type = name.slice(name.lastIndexOf('.') + 1);
    		}

    		if ($$self.$$.dirty & /*path, $fileState*/ 24) {
    			$$invalidate(1, selected = path === $fileState.currentPath);
    		}
    	};

    	return [name, selected, selectFile, path, $fileState];
    }

    class File extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$3(this, options, instance$d, create_fragment$d, safe_not_equal, { name: 0, path: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "File",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !('name' in props)) {
    			console.warn("<File> was created without expected prop 'name'");
    		}

    		if (/*path*/ ctx[3] === undefined && !('path' in props)) {
    			console.warn("<File> was created without expected prop 'path'");
    		}
    	}

    	get name() {
    		throw new Error("<File>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<File>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get path() {
    		throw new Error("<File>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<File>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Folder.svelte generated by Svelte v3.49.0 */
    const file$b = "src\\components\\Folder.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (16:4) {:else}
    function create_else_block_1$1(ctx) {
    	let i;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "fa fa-folder-o");
    			add_location(i, file$b, 16, 8, 331);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(16:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (14:4) {#if expanded}
    function create_if_block_2$2(ctx) {
    	let i;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "fa fa-folder-open-o");
    			add_location(i, file$b, 14, 8, 273);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(14:4) {#if expanded}",
    		ctx
    	});

    	return block;
    }

    // (23:0) {#if expanded}
    function create_if_block$4(ctx) {
    	let ul;
    	let current;
    	let each_value = /*files*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "svelte-ari40g");
    			add_location(ul, file$b, 23, 4, 453);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*files*/ 4) {
    				each_value = /*files*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(23:0) {#if expanded}",
    		ctx
    	});

    	return block;
    }

    // (29:16) {:else}
    function create_else_block$2(ctx) {
    	let file_1;
    	let current;

    	file_1 = new File({
    			props: {
    				name: /*file*/ ctx[4].name,
    				path: /*file*/ ctx[4].path
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(file_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(file_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const file_1_changes = {};
    			if (dirty & /*files*/ 4) file_1_changes.name = /*file*/ ctx[4].name;
    			if (dirty & /*files*/ 4) file_1_changes.path = /*file*/ ctx[4].path;
    			file_1.$set(file_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(file_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(file_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(file_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(29:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (27:16) {#if file.children}
    function create_if_block_1$3(ctx) {
    	let folder;
    	let current;

    	folder = new Folder({
    			props: {
    				name: /*file*/ ctx[4].name,
    				files: /*file*/ ctx[4].children
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(folder.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(folder, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const folder_changes = {};
    			if (dirty & /*files*/ 4) folder_changes.name = /*file*/ ctx[4].name;
    			if (dirty & /*files*/ 4) folder_changes.files = /*file*/ ctx[4].children;
    			folder.$set(folder_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(folder.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(folder.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(folder, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(27:16) {#if file.children}",
    		ctx
    	});

    	return block;
    }

    // (25:8) {#each files as file}
    function create_each_block$2(ctx) {
    	let li;
    	let current_block_type_index;
    	let if_block;
    	let t;
    	let current;
    	const if_block_creators = [create_if_block_1$3, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*file*/ ctx[4].children) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			li = element("li");
    			if_block.c();
    			t = space();
    			attr_dev(li, "class", "svelte-ari40g");
    			add_location(li, file$b, 25, 12, 502);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			if_blocks[current_block_type_index].m(li, null);
    			append_dev(li, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(li, t);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(25:8) {#each files as file}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let t0;
    	let div;
    	let t1;
    	let span;
    	let t2;
    	let t3;
    	let if_block1_anchor;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*expanded*/ ctx[0]) return create_if_block_2$2;
    		return create_else_block_1$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*expanded*/ ctx[0] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			t0 = space();
    			div = element("div");
    			if_block0.c();
    			t1 = space();
    			span = element("span");
    			t2 = text(/*name*/ ctx[1]);
    			t3 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			attr_dev(span, "class", "svelte-ari40g");
    			add_location(span, file$b, 19, 4, 384);
    			attr_dev(div, "class", "folder-container svelte-ari40g");
    			add_location(div, file$b, 12, 0, 213);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			if_block0.m(div, null);
    			append_dev(div, t1);
    			append_dev(div, span);
    			append_dev(span, t2);
    			insert_dev(target, t3, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*toggle*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div, t1);
    				}
    			}

    			if (!current || dirty & /*name*/ 2) set_data_dev(t2, /*name*/ ctx[1]);

    			if (/*expanded*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*expanded*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$4(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			if_block0.d();
    			if (detaching) detach_dev(t3);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Folder', slots, []);
    	let { expanded = true } = $$props;
    	let { name } = $$props;
    	let { files = [] } = $$props;

    	function toggle() {
    		$$invalidate(0, expanded = !expanded);
    	}

    	const writable_props = ['expanded', 'name', 'files'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Folder> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('expanded' in $$props) $$invalidate(0, expanded = $$props.expanded);
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    		if ('files' in $$props) $$invalidate(2, files = $$props.files);
    	};

    	$$self.$capture_state = () => ({ File, expanded, name, files, toggle });

    	$$self.$inject_state = $$props => {
    		if ('expanded' in $$props) $$invalidate(0, expanded = $$props.expanded);
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    		if ('files' in $$props) $$invalidate(2, files = $$props.files);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [expanded, name, files, toggle];
    }

    class Folder extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$3(this, options, instance$c, create_fragment$c, safe_not_equal, { expanded: 0, name: 1, files: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Folder",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[1] === undefined && !('name' in props)) {
    			console.warn("<Folder> was created without expected prop 'name'");
    		}
    	}

    	get expanded() {
    		throw new Error("<Folder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set expanded(value) {
    		throw new Error("<Folder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Folder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Folder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get files() {
    		throw new Error("<Folder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set files(value) {
    		throw new Error("<Folder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const exitBeforeEnter = writable(false);
    /**
     * The transition state of the modals
     */
    const transitioning = writable(null);
    /**
     * A Svelte store containing the current modal stack
     */
    const modals = writable([]);
    /**
     * A Svelte store describing how the current modal came to be active ("push" or "pop").
     * This can be useful for transitions if they should animate differently based on the action.
     */
    const action = writable(null);
    /**
     * Closes the last `amount` of modals in the stack
     *
     * If closing was prevented by the current modal, it returns false
     */
    function closeModals(amount = 1) {
        var _a, _b;
        const modalsLength = get_store_value(modals).length;
        const currentModal = get_store_value(modals)[modalsLength - 1];
        if (get_store_value(transitioning)) {
            return false;
        }
        if ((_a = currentModal === null || currentModal === void 0 ? void 0 : currentModal.callbacks) === null || _a === void 0 ? void 0 : _a.onBeforeClose) {
            if (((_b = currentModal === null || currentModal === void 0 ? void 0 : currentModal.callbacks) === null || _b === void 0 ? void 0 : _b.onBeforeClose()) === false) {
                return false;
            }
        }
        if (get_store_value(exitBeforeEnter) && modalsLength > 0) {
            transitioning.set(true);
        }
        exitBeforeEnter.set(false);
        action.set('pop');
        pop(amount);
        return true;
    }
    /**
     * Closes the current modal component
     *
     * If closing was prevented by the current modal, it returns false
     */
    function closeModal() {
        return closeModals(1);
    }
    /**
     * Opens a new modal
     */
    function openModal(component, props, options) {
        if (get_store_value(transitioning)) {
            return;
        }
        action.set('push');
        if (get_store_value(exitBeforeEnter) && get_store_value(modals).length) {
            transitioning.set(true);
        }
        exitBeforeEnter.set(false);
        if (options === null || options === void 0 ? void 0 : options.replace) {
            modals.update((prev) => [...prev.slice(0, prev.length - 1), { component, props }]);
        }
        else {
            modals.update((prev) => [...prev, { component, props }]);
        }
    }
    function pop(amount = 1) {
        modals.update((prev) => prev.slice(0, Math.max(0, prev.length - amount)));
    }

    /* node_modules\svelte-modals\Modals.svelte generated by Svelte v3.49.0 */

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	child_ctx[11] = i;
    	return child_ctx;
    }

    const get_loading_slot_changes = dirty => ({});
    const get_loading_slot_context = ctx => ({});
    const get_backdrop_slot_changes = dirty => ({});
    const get_backdrop_slot_context = ctx => ({});

    // (13:0) {#if $modals.length > 0}
    function create_if_block_1$2(ctx) {
    	let current;
    	const backdrop_slot_template = /*#slots*/ ctx[4].backdrop;
    	const backdrop_slot = create_slot(backdrop_slot_template, ctx, /*$$scope*/ ctx[3], get_backdrop_slot_context);

    	const block = {
    		c: function create() {
    			if (backdrop_slot) backdrop_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (backdrop_slot) {
    				backdrop_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (backdrop_slot) {
    				if (backdrop_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						backdrop_slot,
    						backdrop_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(backdrop_slot_template, /*$$scope*/ ctx[3], dirty, get_backdrop_slot_changes),
    						get_backdrop_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(backdrop_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(backdrop_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (backdrop_slot) backdrop_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(13:0) {#if $modals.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (36:4) {:else}
    function create_else_block$1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{
    			isOpen: /*i*/ ctx[11] === /*$modals*/ ctx[0].length - 1 && !/*$transitioning*/ ctx[1]
    		},
    		/*modal*/ ctx[9].props
    	];

    	var switch_value = /*modal*/ ctx[9].component;

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("introstart", /*introstart_handler_1*/ ctx[7]);
    		switch_instance.$on("outroend", /*outroend_handler_1*/ ctx[8]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*$modals, $transitioning*/ 3)
    			? get_spread_update(switch_instance_spread_levels, [
    					{
    						isOpen: /*i*/ ctx[11] === /*$modals*/ ctx[0].length - 1 && !/*$transitioning*/ ctx[1]
    					},
    					dirty & /*$modals*/ 1 && get_spread_object(/*modal*/ ctx[9].props)
    				])
    			: {};

    			if (switch_value !== (switch_value = /*modal*/ ctx[9].component)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("introstart", /*introstart_handler_1*/ ctx[7]);
    					switch_instance.$on("outroend", /*outroend_handler_1*/ ctx[8]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(36:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (20:4) {#if isLazyModal(modal.component)}
    function create_if_block$3(ctx) {
    	let await_block_anchor;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 12,
    		blocks: [,,,]
    	};

    	handle_promise(promise = getComponent(/*modal*/ ctx[9].component), info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*$modals*/ 1 && promise !== (promise = getComponent(/*modal*/ ctx[9].component)) && handle_promise(promise, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(20:4) {#if isLazyModal(modal.component)}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>   import { modals, exitBeforeEnter, transitioning }
    function create_catch_block(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <script>   import { modals, exitBeforeEnter, transitioning }",
    		ctx
    	});

    	return block;
    }

    // (23:6) {:then component}
    function create_then_block(ctx) {
    	let switch_instance;
    	let t;
    	let current;

    	const switch_instance_spread_levels = [
    		{
    			isOpen: /*i*/ ctx[11] === /*$modals*/ ctx[0].length - 1 && !/*$transitioning*/ ctx[1]
    		},
    		/*modal*/ ctx[9].props
    	];

    	var switch_value = /*component*/ ctx[12];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("introstart", /*introstart_handler*/ ctx[5]);
    		switch_instance.$on("outroend", /*outroend_handler*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*$modals, $transitioning*/ 3)
    			? get_spread_update(switch_instance_spread_levels, [
    					{
    						isOpen: /*i*/ ctx[11] === /*$modals*/ ctx[0].length - 1 && !/*$transitioning*/ ctx[1]
    					},
    					dirty & /*$modals*/ 1 && get_spread_object(/*modal*/ ctx[9].props)
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[12])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("introstart", /*introstart_handler*/ ctx[5]);
    					switch_instance.$on("outroend", /*outroend_handler*/ ctx[6]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, t.parentNode, t);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (switch_instance) destroy_component(switch_instance, detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(23:6) {:then component}",
    		ctx
    	});

    	return block;
    }

    // (21:44)          <slot name="loading" />       {:then component}
    function create_pending_block(ctx) {
    	let t;
    	let current;
    	const loading_slot_template = /*#slots*/ ctx[4].loading;
    	const loading_slot = create_slot(loading_slot_template, ctx, /*$$scope*/ ctx[3], get_loading_slot_context);

    	const block = {
    		c: function create() {
    			if (loading_slot) loading_slot.c();
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			if (loading_slot) {
    				loading_slot.m(target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (loading_slot) {
    				if (loading_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						loading_slot,
    						loading_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(loading_slot_template, /*$$scope*/ ctx[3], dirty, get_loading_slot_changes),
    						get_loading_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(loading_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(loading_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (loading_slot) loading_slot.d(detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(21:44)          <slot name=\\\"loading\\\" />       {:then component}",
    		ctx
    	});

    	return block;
    }

    // (18:2) {#each $modals as modal, i (i)}
    function create_each_block$1(key_1, ctx) {
    	let first;
    	let show_if;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$3, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (dirty & /*$modals*/ 1) show_if = null;
    		if (show_if == null) show_if = !!isLazyModal(/*modal*/ ctx[9].component);
    		if (show_if) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx, -1);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx, dirty);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(18:2) {#each $modals as modal, i (i)}",
    		ctx
    	});

    	return block;
    }

    // (17:6)    
    function fallback_block(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = /*$modals*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*i*/ ctx[11];
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*getComponent, $modals, $$scope, $transitioning, $exitBeforeEnter, isLazyModal*/ 15) {
    				each_value = /*$modals*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$1, each_1_anchor, get_each_context$1);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(17:6)    ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let t;
    	let current;
    	let if_block = /*$modals*/ ctx[0].length > 0 && create_if_block_1$2(ctx);
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);
    	const default_slot_or_fallback = default_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t, anchor);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$modals*/ ctx[0].length > 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$modals*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t.parentNode, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
    						null
    					);
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && (!current || dirty & /*$modals, $$scope, $transitioning, $exitBeforeEnter*/ 15)) {
    					default_slot_or_fallback.p(ctx, !current ? -1 : dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function isLazyModal(component) {
    	return typeof component.prototype === 'undefined';
    }

    async function getComponent(component) {
    	return component().then(res => res.default);
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let $modals;
    	let $transitioning;
    	let $exitBeforeEnter;
    	validate_store(modals, 'modals');
    	component_subscribe($$self, modals, $$value => $$invalidate(0, $modals = $$value));
    	validate_store(transitioning, 'transitioning');
    	component_subscribe($$self, transitioning, $$value => $$invalidate(1, $transitioning = $$value));
    	validate_store(exitBeforeEnter, 'exitBeforeEnter');
    	component_subscribe($$self, exitBeforeEnter, $$value => $$invalidate(2, $exitBeforeEnter = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Modals', slots, ['backdrop','loading','default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Modals> was created with unknown prop '${key}'`);
    	});

    	const introstart_handler = () => {
    		set_store_value(exitBeforeEnter, $exitBeforeEnter = true, $exitBeforeEnter);
    	};

    	const outroend_handler = () => {
    		set_store_value(transitioning, $transitioning = false, $transitioning);
    	};

    	const introstart_handler_1 = () => {
    		set_store_value(exitBeforeEnter, $exitBeforeEnter = true, $exitBeforeEnter);
    	};

    	const outroend_handler_1 = () => {
    		set_store_value(transitioning, $transitioning = false, $transitioning);
    	};

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		modals,
    		exitBeforeEnter,
    		transitioning,
    		isLazyModal,
    		getComponent,
    		$modals,
    		$transitioning,
    		$exitBeforeEnter
    	});

    	return [
    		$modals,
    		$transitioning,
    		$exitBeforeEnter,
    		$$scope,
    		slots,
    		introstart_handler,
    		outroend_handler,
    		introstart_handler_1,
    		outroend_handler_1
    	];
    }

    class Modals extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$3(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modals",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src\components\BaseModal.svelte generated by Svelte v3.49.0 */
    const file$a = "src\\components\\BaseModal.svelte";

    // (27:0) {#if isOpen}
    function create_if_block$2(ctx) {
    	let div3;
    	let div2;
    	let h1;
    	let t0;
    	let t1;
    	let div0;
    	let t2;
    	let div1;
    	let t3;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);
    	let if_block0 = /*showOk*/ ctx[3] && create_if_block_2$1(ctx);
    	let if_block1 = /*showCancel*/ ctx[2] && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			h1 = element("h1");
    			t0 = text(/*title*/ ctx[1]);
    			t1 = space();
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			t2 = space();
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t3 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(h1, "class", "title svelte-rh7tva");
    			add_location(h1, file$a, 29, 12, 624);
    			attr_dev(div0, "class", "content svelte-rh7tva");
    			add_location(div0, file$a, 30, 12, 668);
    			attr_dev(div1, "class", "actions svelte-rh7tva");
    			add_location(div1, file$a, 33, 12, 754);
    			attr_dev(div2, "class", "contents svelte-rh7tva");
    			add_location(div2, file$a, 28, 8, 588);
    			attr_dev(div3, "role", "dialog");
    			attr_dev(div3, "class", "modal svelte-rh7tva");
    			add_location(div3, file$a, 27, 4, 545);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, h1);
    			append_dev(h1, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t3);
    			if (if_block1) if_block1.m(div1, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*title*/ 2) set_data_dev(t0, /*title*/ ctx[1]);

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 64)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[6],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[6])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null),
    						null
    					);
    				}
    			}

    			if (/*showOk*/ ctx[3]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2$1(ctx);
    					if_block0.c();
    					if_block0.m(div1, t3);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*showCancel*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$1(ctx);
    					if_block1.c();
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (default_slot) default_slot.d(detaching);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(27:0) {#if isOpen}",
    		ctx
    	});

    	return block;
    }

    // (35:16) {#if showOk}
    function create_if_block_2$1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "OK";
    			attr_dev(button, "class", "svelte-rh7tva");
    			add_location(button, file$a, 35, 20, 827);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*handleOk*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(35:16) {#if showOk}",
    		ctx
    	});

    	return block;
    }

    // (39:16) {#if showCancel}
    function create_if_block_1$1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Cancel";
    			attr_dev(button, "class", "svelte-rh7tva");
    			add_location(button, file$a, 39, 20, 947);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", closeModal, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(39:16) {#if showCancel}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let t;
    	let if_block_anchor;
    	let current;
    	let if_block = /*isOpen*/ ctx[0] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*isOpen*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*isOpen*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('BaseModal', slots, ['default']);
    	let { isOpen } = $$props;
    	let { title } = $$props;
    	let { showCancel = false } = $$props;
    	let { showOk = true } = $$props;
    	let { onOk } = $$props;

    	async function handleOk() {
    		if (onOk) {
    			let canContinue = onOk();

    			if (canContinue) {
    				closeModal();
    			}
    		} else {
    			closeModal();
    		}
    	}

    	const writable_props = ['isOpen', 'title', 'showCancel', 'showOk', 'onOk'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<BaseModal> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('isOpen' in $$props) $$invalidate(0, isOpen = $$props.isOpen);
    		if ('title' in $$props) $$invalidate(1, title = $$props.title);
    		if ('showCancel' in $$props) $$invalidate(2, showCancel = $$props.showCancel);
    		if ('showOk' in $$props) $$invalidate(3, showOk = $$props.showOk);
    		if ('onOk' in $$props) $$invalidate(5, onOk = $$props.onOk);
    		if ('$$scope' in $$props) $$invalidate(6, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		closeModal,
    		isOpen,
    		title,
    		showCancel,
    		showOk,
    		onOk,
    		handleOk
    	});

    	$$self.$inject_state = $$props => {
    		if ('isOpen' in $$props) $$invalidate(0, isOpen = $$props.isOpen);
    		if ('title' in $$props) $$invalidate(1, title = $$props.title);
    		if ('showCancel' in $$props) $$invalidate(2, showCancel = $$props.showCancel);
    		if ('showOk' in $$props) $$invalidate(3, showOk = $$props.showOk);
    		if ('onOk' in $$props) $$invalidate(5, onOk = $$props.onOk);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [isOpen, title, showCancel, showOk, handleOk, onOk, $$scope, slots];
    }

    class BaseModal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init$3(this, options, instance$a, create_fragment$a, safe_not_equal, {
    			isOpen: 0,
    			title: 1,
    			showCancel: 2,
    			showOk: 3,
    			onOk: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BaseModal",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*isOpen*/ ctx[0] === undefined && !('isOpen' in props)) {
    			console.warn("<BaseModal> was created without expected prop 'isOpen'");
    		}

    		if (/*title*/ ctx[1] === undefined && !('title' in props)) {
    			console.warn("<BaseModal> was created without expected prop 'title'");
    		}

    		if (/*onOk*/ ctx[5] === undefined && !('onOk' in props)) {
    			console.warn("<BaseModal> was created without expected prop 'onOk'");
    		}
    	}

    	get isOpen() {
    		throw new Error("<BaseModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isOpen(value) {
    		throw new Error("<BaseModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<BaseModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<BaseModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showCancel() {
    		throw new Error("<BaseModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showCancel(value) {
    		throw new Error("<BaseModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showOk() {
    		throw new Error("<BaseModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showOk(value) {
    		throw new Error("<BaseModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onOk() {
    		throw new Error("<BaseModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onOk(value) {
    		throw new Error("<BaseModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\modals\CreateModule.svelte generated by Svelte v3.49.0 */
    const file$9 = "src\\modals\\CreateModule.svelte";

    // (13:0) <BaseModal {...$$props} title="Create Module" showCancel={true} onOk={createFile}>
    function create_default_slot$3(ctx) {
    	let div;
    	let t1;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "You can create a module here.";
    			t1 = space();
    			input = element("input");
    			add_location(div, file$9, 13, 4, 390);
    			attr_dev(input, "class", "svelte-122xswa");
    			add_location(input, file$9, 14, 4, 436);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*namespace*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[3]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*namespace*/ 1 && input.value !== /*namespace*/ ctx[0]) {
    				set_input_value(input, /*namespace*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(13:0) <BaseModal {...$$props} title=\\\"Create Module\\\" showCancel={true} onOk={createFile}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let t;
    	let basemodal;
    	let current;

    	const basemodal_spread_levels = [
    		/*$$props*/ ctx[2],
    		{ title: "Create Module" },
    		{ showCancel: true },
    		{ onOk: /*createFile*/ ctx[1] }
    	];

    	let basemodal_props = {
    		$$slots: { default: [create_default_slot$3] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < basemodal_spread_levels.length; i += 1) {
    		basemodal_props = assign(basemodal_props, basemodal_spread_levels[i]);
    	}

    	basemodal = new BaseModal({ props: basemodal_props, $$inline: true });

    	const block = {
    		c: function create() {
    			t = space();
    			create_component(basemodal.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			mount_component(basemodal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const basemodal_changes = (dirty & /*$$props, createFile*/ 6)
    			? get_spread_update(basemodal_spread_levels, [
    					dirty & /*$$props*/ 4 && get_spread_object(/*$$props*/ ctx[2]),
    					basemodal_spread_levels[1],
    					basemodal_spread_levels[2],
    					dirty & /*createFile*/ 2 && { onOk: /*createFile*/ ctx[1] }
    				])
    			: {};

    			if (dirty & /*$$scope, namespace*/ 17) {
    				basemodal_changes.$$scope = { dirty, ctx };
    			}

    			basemodal.$set(basemodal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(basemodal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(basemodal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			destroy_component(basemodal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CreateModule', slots, []);
    	let namespace = "";

    	const createFile = async function () {
    		await createNewModule(namespace);
    		return false;
    	};

    	function input_input_handler() {
    		namespace = this.value;
    		$$invalidate(0, namespace);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({
    		createNewModule,
    		BaseModal,
    		namespace,
    		createFile
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), $$new_props));
    		if ('namespace' in $$props) $$invalidate(0, namespace = $$new_props.namespace);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [namespace, createFile, $$props, input_input_handler];
    }

    class CreateModule extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$3(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CreateModule",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src\components\FileExplorer.svelte generated by Svelte v3.49.0 */
    const file$8 = "src\\components\\FileExplorer.svelte";

    function create_fragment$8(ctx) {
    	let t0;
    	let div0;
    	let button0;
    	let i0;
    	let t1;
    	let button1;
    	let i1;
    	let t2;
    	let div1;
    	let folder;
    	let current;
    	let mounted;
    	let dispose;

    	folder = new Folder({
    			props: {
    				name: "Files",
    				files: /*root*/ ctx[0],
    				expanded: true
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			t0 = space();
    			div0 = element("div");
    			button0 = element("button");
    			i0 = element("i");
    			t1 = space();
    			button1 = element("button");
    			i1 = element("i");
    			t2 = space();
    			div1 = element("div");
    			create_component(folder.$$.fragment);
    			attr_dev(i0, "class", "fa fa-plus");
    			add_location(i0, file$8, 28, 66, 770);
    			attr_dev(button0, "class", "small no-border");
    			add_location(button0, file$8, 28, 4, 708);
    			attr_dev(i1, "class", "fa fa-trash");
    			add_location(i1, file$8, 29, 61, 868);
    			attr_dev(button1, "class", "small no-border");
    			add_location(button1, file$8, 29, 4, 811);
    			attr_dev(div0, "class", "button-row svelte-1pngpas");
    			add_location(div0, file$8, 27, 0, 678);
    			attr_dev(div1, "class", "file-explorer svelte-1pngpas");
    			add_location(div1, file$8, 32, 0, 916);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div0, anchor);
    			append_dev(div0, button0);
    			append_dev(button0, i0);
    			append_dev(div0, t1);
    			append_dev(div0, button1);
    			append_dev(button1, i1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div1, anchor);
    			mount_component(folder, div1, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*handleCreateModule*/ ctx[1], false, false, false),
    					listen_dev(button1, "click", /*_deleteModule*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const folder_changes = {};
    			if (dirty & /*root*/ 1) folder_changes.files = /*root*/ ctx[0];
    			folder.$set(folder_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(folder.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(folder.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div1);
    			destroy_component(folder);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FileExplorer', slots, []);
    	let root = [];
    	let currentPath;

    	fileState.subscribe(s => {
    		$$invalidate(0, root = s.files);
    		currentPath = s.currentPath;
    	});

    	function handleCreateModule() {
    		openModal(CreateModule, {});
    	}

    	function _deleteModule() {
    		if (currentPath) {
    			// console.log(currentPath);
    			deleteModule(currentPath);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FileExplorer> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Folder,
    		fileState,
    		deleteModule,
    		openModal,
    		CreateModule,
    		root,
    		currentPath,
    		handleCreateModule,
    		_deleteModule
    	});

    	$$self.$inject_state = $$props => {
    		if ('root' in $$props) $$invalidate(0, root = $$props.root);
    		if ('currentPath' in $$props) currentPath = $$props.currentPath;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [root, handleCreateModule, _deleteModule];
    }

    class FileExplorer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$3(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FileExplorer",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\components\Tabs.svelte generated by Svelte v3.49.0 */
    const file$7 = "src\\components\\Tabs.svelte";

    function create_fragment$7(ctx) {
    	let t;
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			t = space();
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "tabs");
    			add_location(div, file$7, 47, 0, 1351);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const TABS = {};

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tabs', slots, ['default']);
    	const tabs = [];
    	const panels = [];
    	const selectedTab = writable(null);
    	const selectedPanel = writable(null);

    	setContext(TABS, {
    		registerTab: tab => {
    			tabs.push(tab);
    			selectedTab.update(current => current || tab);

    			onDestroy(() => {
    				const i = tabs.indexOf(tab);
    				tabs.splice(i, 1);

    				selectedTab.update(current => current === tab
    				? tabs[i] || tabs[tabs.length - 1]
    				: current);
    			});
    		},
    		registerPanel: panel => {
    			panels.push(panel);
    			selectedPanel.update(current => current || panel);

    			onDestroy(() => {
    				const i = panels.indexOf(panel);
    				panels.splice(i, 1);

    				selectedPanel.update(current => current === panel
    				? panels[i] || panels[panels.length - 1]
    				: current);
    			});
    		},
    		selectTab: tab => {
    			const i = tabs.indexOf(tab);
    			selectedTab.set(tab);
    			selectedPanel.set(panels[i]);
    		},
    		selectedTab,
    		selectedPanel
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Tabs> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		TABS,
    		setContext,
    		onDestroy,
    		writable,
    		tabs,
    		panels,
    		selectedTab,
    		selectedPanel
    	});

    	return [$$scope, slots];
    }

    class Tabs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$3(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tabs",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\components\TabList.svelte generated by Svelte v3.49.0 */

    const file$6 = "src\\components\\TabList.svelte";

    function create_fragment$6(ctx) {
    	let t;
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			t = space();
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "tab-list svelte-123llh6");
    			add_location(div, file$6, 0, 1, 1);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TabList', slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TabList> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class TabList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$3(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TabList",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\components\TabPanel.svelte generated by Svelte v3.49.0 */
    const file$5 = "src\\components\\TabPanel.svelte";

    // (11:0) {#if $selectedPanel === panel}
    function create_if_block$1(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "tab-panel svelte-1a8r3lo");
    			add_location(div, file$5, 11, 4, 263);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(11:0) {#if $selectedPanel === panel}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let t;
    	let if_block_anchor;
    	let current;
    	let if_block = /*$selectedPanel*/ ctx[0] === /*panel*/ ctx[1] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$selectedPanel*/ ctx[0] === /*panel*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$selectedPanel*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $selectedPanel;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TabPanel', slots, ['default']);
    	const panel = {};
    	const { registerPanel, selectedPanel } = getContext(TABS);
    	validate_store(selectedPanel, 'selectedPanel');
    	component_subscribe($$self, selectedPanel, value => $$invalidate(0, $selectedPanel = value));
    	registerPanel(panel);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TabPanel> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		TABS,
    		panel,
    		registerPanel,
    		selectedPanel,
    		$selectedPanel
    	});

    	return [$selectedPanel, panel, selectedPanel, $$scope, slots];
    }

    class TabPanel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$3(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TabPanel",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\components\Tab.svelte generated by Svelte v3.49.0 */
    const file$4 = "src\\components\\Tab.svelte";

    function create_fragment$4(ctx) {
    	let t;
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			t = space();
    			button = element("button");
    			if (default_slot) default_slot.c();
    			attr_dev(button, "class", "svelte-16v7wsi");
    			toggle_class(button, "selected", /*$selectedTab*/ ctx[0] === /*tab*/ ctx[1]);
    			add_location(button, file$4, 24, 0, 456);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[4],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null),
    						null
    					);
    				}
    			}

    			if (dirty & /*$selectedTab, tab*/ 3) {
    				toggle_class(button, "selected", /*$selectedTab*/ ctx[0] === /*tab*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $selectedTab;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tab', slots, ['default']);
    	const tab = {};
    	const { registerTab, selectTab, selectedTab } = getContext(TABS);
    	validate_store(selectedTab, 'selectedTab');
    	component_subscribe($$self, selectedTab, value => $$invalidate(0, $selectedTab = value));
    	registerTab(tab);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Tab> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => selectTab(tab);

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		TABS,
    		tab,
    		registerTab,
    		selectTab,
    		selectedTab,
    		$selectedTab
    	});

    	return [$selectedTab, tab, selectTab, selectedTab, $$scope, slots, click_handler];
    }

    class Tab extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$3(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tab",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\pages\editor.svelte generated by Svelte v3.49.0 */
    const file$3 = "src\\pages\\editor.svelte";

    // (54:4) <Tab>
    function create_default_slot_9(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Page");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_9.name,
    		type: "slot",
    		source: "(54:4) <Tab>",
    		ctx
    	});

    	return block;
    }

    // (55:4) <Tab>
    function create_default_slot_8(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Component Diagram");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8.name,
    		type: "slot",
    		source: "(55:4) <Tab>",
    		ctx
    	});

    	return block;
    }

    // (56:4) <Tab>
    function create_default_slot_7(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Data Diagram");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(56:4) <Tab>",
    		ctx
    	});

    	return block;
    }

    // (57:4) <Tab>
    function create_default_slot_6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Views");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(57:4) <Tab>",
    		ctx
    	});

    	return block;
    }

    // (53:3) <TabList>
    function create_default_slot_5(ctx) {
    	let tab0;
    	let t0;
    	let tab1;
    	let t1;
    	let tab2;
    	let t2;
    	let tab3;
    	let current;

    	tab0 = new Tab({
    			props: {
    				$$slots: { default: [create_default_slot_9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tab1 = new Tab({
    			props: {
    				$$slots: { default: [create_default_slot_8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tab2 = new Tab({
    			props: {
    				$$slots: { default: [create_default_slot_7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tab3 = new Tab({
    			props: {
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tab0.$$.fragment);
    			t0 = space();
    			create_component(tab1.$$.fragment);
    			t1 = space();
    			create_component(tab2.$$.fragment);
    			t2 = space();
    			create_component(tab3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tab0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(tab1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(tab2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(tab3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tab0_changes = {};

    			if (dirty & /*$$scope*/ 128) {
    				tab0_changes.$$scope = { dirty, ctx };
    			}

    			tab0.$set(tab0_changes);
    			const tab1_changes = {};

    			if (dirty & /*$$scope*/ 128) {
    				tab1_changes.$$scope = { dirty, ctx };
    			}

    			tab1.$set(tab1_changes);
    			const tab2_changes = {};

    			if (dirty & /*$$scope*/ 128) {
    				tab2_changes.$$scope = { dirty, ctx };
    			}

    			tab2.$set(tab2_changes);
    			const tab3_changes = {};

    			if (dirty & /*$$scope*/ 128) {
    				tab3_changes.$$scope = { dirty, ctx };
    			}

    			tab3.$set(tab3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tab0.$$.fragment, local);
    			transition_in(tab1.$$.fragment, local);
    			transition_in(tab2.$$.fragment, local);
    			transition_in(tab3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tab0.$$.fragment, local);
    			transition_out(tab1.$$.fragment, local);
    			transition_out(tab2.$$.fragment, local);
    			transition_out(tab3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tab0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(tab1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(tab2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(tab3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(53:3) <TabList>",
    		ctx
    	});

    	return block;
    }

    // (63:4) {:else}
    function create_else_block_2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Nothing to see";
    			add_location(div, file$3, 63, 5, 1501);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(63:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (61:4) {#if cPath && dir}
    function create_if_block_2(ctx) {
    	let iframe;
    	let iframe_src_value;

    	const block = {
    		c: function create() {
    			iframe = element("iframe");
    			attr_dev(iframe, "title", "index");
    			if (!src_url_equal(iframe.src, iframe_src_value = `/project-file/${/*dir*/ ctx[1]}/${/*cPath*/ ctx[2]}/index.html?${/*time*/ ctx[0]}`)) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "class", "svelte-debon");
    			add_location(iframe, file$3, 61, 5, 1400);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, iframe, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dir, cPath, time*/ 7 && !src_url_equal(iframe.src, iframe_src_value = `/project-file/${/*dir*/ ctx[1]}/${/*cPath*/ ctx[2]}/index.html?${/*time*/ ctx[0]}`)) {
    				attr_dev(iframe, "src", iframe_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(iframe);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(61:4) {#if cPath && dir}",
    		ctx
    	});

    	return block;
    }

    // (60:3) <TabPanel>
    function create_default_slot_4(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*cPath*/ ctx[2] && /*dir*/ ctx[1]) return create_if_block_2;
    		return create_else_block_2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(60:3) <TabPanel>",
    		ctx
    	});

    	return block;
    }

    // (70:4) {:else}
    function create_else_block_1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Nothing to see";
    			add_location(div, file$3, 70, 5, 1705);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(70:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (68:4) {#if cPath && dir}
    function create_if_block_1(ctx) {
    	let iframe;
    	let iframe_src_value;

    	const block = {
    		c: function create() {
    			iframe = element("iframe");
    			attr_dev(iframe, "title", "result");
    			if (!src_url_equal(iframe.src, iframe_src_value = `/project-file/${/*dir*/ ctx[1]}/${/*cPath*/ ctx[2]}/components.svg?${/*time*/ ctx[0]}`)) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "class", "svelte-debon");
    			add_location(iframe, file$3, 68, 5, 1599);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, iframe, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dir, cPath, time*/ 7 && !src_url_equal(iframe.src, iframe_src_value = `/project-file/${/*dir*/ ctx[1]}/${/*cPath*/ ctx[2]}/components.svg?${/*time*/ ctx[0]}`)) {
    				attr_dev(iframe, "src", iframe_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(iframe);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(68:4) {#if cPath && dir}",
    		ctx
    	});

    	return block;
    }

    // (67:3) <TabPanel>
    function create_default_slot_3(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*cPath*/ ctx[2] && /*dir*/ ctx[1]) return create_if_block_1;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(67:3) <TabPanel>",
    		ctx
    	});

    	return block;
    }

    // (77:4) {:else}
    function create_else_block(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Nothing to see";
    			add_location(div, file$3, 77, 5, 1906);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(77:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (75:4) {#if cPath && dir}
    function create_if_block(ctx) {
    	let iframe;
    	let iframe_src_value;

    	const block = {
    		c: function create() {
    			iframe = element("iframe");
    			attr_dev(iframe, "title", "result");
    			if (!src_url_equal(iframe.src, iframe_src_value = `/project-file/${/*dir*/ ctx[1]}/${/*cPath*/ ctx[2]}/data.svg?${/*time*/ ctx[0]}`)) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "class", "svelte-debon");
    			add_location(iframe, file$3, 75, 5, 1806);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, iframe, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dir, cPath, time*/ 7 && !src_url_equal(iframe.src, iframe_src_value = `/project-file/${/*dir*/ ctx[1]}/${/*cPath*/ ctx[2]}/data.svg?${/*time*/ ctx[0]}`)) {
    				attr_dev(iframe, "src", iframe_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(iframe);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(75:4) {#if cPath && dir}",
    		ctx
    	});

    	return block;
    }

    // (74:3) <TabPanel>
    function create_default_slot_2(ctx) {
    	let if_block_anchor;

    	function select_block_type_2(ctx, dirty) {
    		if (/*cPath*/ ctx[2] && /*dir*/ ctx[1]) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type_2(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(74:3) <TabPanel>",
    		ctx
    	});

    	return block;
    }

    // (81:3) <TabPanel>
    function create_default_slot_1$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Views";
    			add_location(div, file$3, 81, 4, 1979);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(81:3) <TabPanel>",
    		ctx
    	});

    	return block;
    }

    // (52:2) <Tabs class="tabs">
    function create_default_slot$2(ctx) {
    	let tablist;
    	let t0;
    	let tabpanel0;
    	let t1;
    	let tabpanel1;
    	let t2;
    	let tabpanel2;
    	let t3;
    	let tabpanel3;
    	let current;

    	tablist = new TabList({
    			props: {
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tabpanel0 = new TabPanel({
    			props: {
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tabpanel1 = new TabPanel({
    			props: {
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tabpanel2 = new TabPanel({
    			props: {
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tabpanel3 = new TabPanel({
    			props: {
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tablist.$$.fragment);
    			t0 = space();
    			create_component(tabpanel0.$$.fragment);
    			t1 = space();
    			create_component(tabpanel1.$$.fragment);
    			t2 = space();
    			create_component(tabpanel2.$$.fragment);
    			t3 = space();
    			create_component(tabpanel3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tablist, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(tabpanel0, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(tabpanel1, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(tabpanel2, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(tabpanel3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tablist_changes = {};

    			if (dirty & /*$$scope*/ 128) {
    				tablist_changes.$$scope = { dirty, ctx };
    			}

    			tablist.$set(tablist_changes);
    			const tabpanel0_changes = {};

    			if (dirty & /*$$scope, dir, cPath, time*/ 135) {
    				tabpanel0_changes.$$scope = { dirty, ctx };
    			}

    			tabpanel0.$set(tabpanel0_changes);
    			const tabpanel1_changes = {};

    			if (dirty & /*$$scope, dir, cPath, time*/ 135) {
    				tabpanel1_changes.$$scope = { dirty, ctx };
    			}

    			tabpanel1.$set(tabpanel1_changes);
    			const tabpanel2_changes = {};

    			if (dirty & /*$$scope, dir, cPath, time*/ 135) {
    				tabpanel2_changes.$$scope = { dirty, ctx };
    			}

    			tabpanel2.$set(tabpanel2_changes);
    			const tabpanel3_changes = {};

    			if (dirty & /*$$scope*/ 128) {
    				tabpanel3_changes.$$scope = { dirty, ctx };
    			}

    			tabpanel3.$set(tabpanel3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tablist.$$.fragment, local);
    			transition_in(tabpanel0.$$.fragment, local);
    			transition_in(tabpanel1.$$.fragment, local);
    			transition_in(tabpanel2.$$.fragment, local);
    			transition_in(tabpanel3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tablist.$$.fragment, local);
    			transition_out(tabpanel0.$$.fragment, local);
    			transition_out(tabpanel1.$$.fragment, local);
    			transition_out(tabpanel2.$$.fragment, local);
    			transition_out(tabpanel3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tablist, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(tabpanel0, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(tabpanel1, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(tabpanel2, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(tabpanel3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(52:2) <Tabs class=\\\"tabs\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let t0;
    	let div6;
    	let div0;
    	let fileexplorer;
    	let t1;
    	let div4;
    	let div3;
    	let div1;
    	let t2;
    	let t3_value = /*$fileState*/ ctx[3].currentPath + "";
    	let t3;
    	let t4;
    	let div2;
    	let editor;
    	let t5;
    	let div5;
    	let tabs;
    	let current;
    	fileexplorer = new FileExplorer({ $$inline: true });

    	editor = new Editor({
    			props: { text: /*$fileState*/ ctx[3].text },
    			$$inline: true
    		});

    	tabs = new Tabs({
    			props: {
    				class: "tabs",
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			t0 = space();
    			div6 = element("div");
    			div0 = element("div");
    			create_component(fileexplorer.$$.fragment);
    			t1 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div1 = element("div");
    			t2 = text("Filename: ");
    			t3 = text(t3_value);
    			t4 = space();
    			div2 = element("div");
    			create_component(editor.$$.fragment);
    			t5 = space();
    			div5 = element("div");
    			create_component(tabs.$$.fragment);
    			attr_dev(div0, "class", "treeview svelte-debon");
    			add_location(div0, file$3, 36, 1, 872);
    			attr_dev(div1, "class", "editor-header svelte-debon");
    			add_location(div1, file$3, 41, 3, 985);
    			attr_dev(div2, "class", "editor-middle svelte-debon");
    			add_location(div2, file$3, 44, 3, 1068);
    			attr_dev(div3, "class", "editor-container svelte-debon");
    			add_location(div3, file$3, 40, 2, 950);
    			attr_dev(div4, "class", "editor svelte-debon");
    			add_location(div4, file$3, 39, 1, 926);
    			attr_dev(div5, "class", "result svelte-debon");
    			add_location(div5, file$3, 49, 1, 1167);
    			attr_dev(div6, "class", "container svelte-debon");
    			add_location(div6, file$3, 35, 0, 846);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div0);
    			mount_component(fileexplorer, div0, null);
    			append_dev(div6, t1);
    			append_dev(div6, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div1, t2);
    			append_dev(div1, t3);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			mount_component(editor, div2, null);
    			append_dev(div6, t5);
    			append_dev(div6, div5);
    			mount_component(tabs, div5, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*$fileState*/ 8) && t3_value !== (t3_value = /*$fileState*/ ctx[3].currentPath + "")) set_data_dev(t3, t3_value);
    			const editor_changes = {};
    			if (dirty & /*$fileState*/ 8) editor_changes.text = /*$fileState*/ ctx[3].text;
    			editor.$set(editor_changes);
    			const tabs_changes = {};

    			if (dirty & /*$$scope, dir, cPath, time*/ 135) {
    				tabs_changes.$$scope = { dirty, ctx };
    			}

    			tabs.$set(tabs_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fileexplorer.$$.fragment, local);
    			transition_in(editor.$$.fragment, local);
    			transition_in(tabs.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fileexplorer.$$.fragment, local);
    			transition_out(editor.$$.fragment, local);
    			transition_out(tabs.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div6);
    			destroy_component(fileexplorer);
    			destroy_component(editor);
    			destroy_component(tabs);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $fileState;
    	validate_store(fileState, 'fileState');
    	component_subscribe($$self, fileState, $$value => $$invalidate(3, $fileState = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Editor', slots, []);
    	let { location } = $$props;

    	// the origin of the navigation, this way we can go back easilly.
    	let origin = location.origin;

    	// the code
    	let text = "";

    	let time = 1;
    	let dir, cPath;

    	fileState.subscribe(s => {
    		$$invalidate(1, dir = encodeURIComponent(s.directory));
    		$$invalidate(2, cPath = encodeURIComponent(s.currentPath));
    	});

    	eventbus$1.subscribe(eventbus$1.EVENTS.SAVE_COMPLETED, () => {
    		// update the time index by one to reload the page.
    		$$invalidate(0, time = time + 1);
    	});

    	const writable_props = ['location'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Editor> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('location' in $$props) $$invalidate(4, location = $$props.location);
    	};

    	$$self.$capture_state = () => ({
    		Editor,
    		FileExplorer,
    		Tabs,
    		Tab,
    		TabList,
    		TabPanel,
    		fileState,
    		eventbus: eventbus$1,
    		location,
    		origin,
    		text,
    		time,
    		dir,
    		cPath,
    		$fileState
    	});

    	$$self.$inject_state = $$props => {
    		if ('location' in $$props) $$invalidate(4, location = $$props.location);
    		if ('origin' in $$props) origin = $$props.origin;
    		if ('text' in $$props) text = $$props.text;
    		if ('time' in $$props) $$invalidate(0, time = $$props.time);
    		if ('dir' in $$props) $$invalidate(1, dir = $$props.dir);
    		if ('cPath' in $$props) $$invalidate(2, cPath = $$props.cPath);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [time, dir, cPath, $fileState, location];
    }

    class Editor_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$3(this, options, instance$3, create_fragment$3, safe_not_equal, { location: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Editor_1",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*location*/ ctx[4] === undefined && !('location' in props)) {
    			console.warn("<Editor> was created without expected prop 'location'");
    		}
    	}

    	get location() {
    		throw new Error("<Editor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set location(value) {
    		throw new Error("<Editor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\lexicon.svelte generated by Svelte v3.49.0 */

    const { console: console_1 } = globals;
    const file$2 = "src\\pages\\lexicon.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (26:1) {#each relations as relation}
    function create_each_block(ctx) {
    	let div;
    	let t_value = JSON.stringify(/*relation*/ ctx[4]) + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			add_location(div, file$2, 26, 2, 534);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*relations*/ 1 && t_value !== (t_value = JSON.stringify(/*relation*/ ctx[4]) + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(26:1) {#each relations as relation}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let t;
    	let div;
    	let each_value = /*relations*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			t = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(div, file$2, 24, 0, 493);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*JSON, relations*/ 1) {
    				each_value = /*relations*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Lexicon', slots, []);
    	const location = "";
    	let basePath;
    	let relations = [];

    	const getRelations = async basePath => {
    		$$invalidate(0, relations = await httpGet(`/relations/${encodeURIComponent(basePath)}/type`));
    		console.log(relations);
    	};

    	fileState.subscribe(state => {
    		if (state.directory && state.directory !== basePath) {
    			getRelations(state.directory);
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Lexicon> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		httpGet,
    		fileState,
    		location,
    		basePath,
    		relations,
    		getRelations
    	});

    	$$self.$inject_state = $$props => {
    		if ('basePath' in $$props) basePath = $$props.basePath;
    		if ('relations' in $$props) $$invalidate(0, relations = $$props.relations);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [relations, location];
    }

    class Lexicon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$3(this, options, instance$2, create_fragment$2, safe_not_equal, { location: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Lexicon",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get location() {
    		return this.$$.ctx[1];
    	}

    	set location(value) {
    		throw new Error("<Lexicon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const pathStore = writable(window.location.pathname); 

    const init$1 = () => {
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

    /* src\components\NavItem.svelte generated by Svelte v3.49.0 */
    const file$1 = "src\\components\\NavItem.svelte";

    // (18:4) <Link to="{route}">
    function create_default_slot$1(ctx) {
    	let div;
    	let i;
    	let i_class_value;
    	let t0;
    	let span;
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			i = element("i");
    			t0 = space();
    			span = element("span");
    			t1 = text(/*title*/ ctx[0]);
    			attr_dev(i, "class", i_class_value = "fa fa-" + /*icon*/ ctx[2] + " svelte-11t5qlb");
    			add_location(i, file$1, 19, 12, 498);
    			attr_dev(span, "class", "svelte-11t5qlb");
    			add_location(span, file$1, 20, 12, 540);
    			attr_dev(div, "class", "nav-item--inner svelte-11t5qlb");
    			add_location(div, file$1, 18, 8, 455);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, i);
    			append_dev(div, t0);
    			append_dev(div, span);
    			append_dev(span, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*icon*/ 4 && i_class_value !== (i_class_value = "fa fa-" + /*icon*/ ctx[2] + " svelte-11t5qlb")) {
    				attr_dev(i, "class", i_class_value);
    			}

    			if (dirty & /*title*/ 1) set_data_dev(t1, /*title*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(18:4) <Link to=\\\"{route}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let t;
    	let div;
    	let link;
    	let current;

    	link = new Link({
    			props: {
    				to: /*route*/ ctx[1],
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			t = space();
    			div = element("div");
    			create_component(link.$$.fragment);
    			attr_dev(div, "class", "nav-item svelte-11t5qlb");
    			toggle_class(div, "selected", /*selected*/ ctx[3]);
    			add_location(div, file$1, 16, 0, 372);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(link, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const link_changes = {};
    			if (dirty & /*route*/ 2) link_changes.to = /*route*/ ctx[1];

    			if (dirty & /*$$scope, title, icon*/ 21) {
    				link_changes.$$scope = { dirty, ctx };
    			}

    			link.$set(link_changes);

    			if (dirty & /*selected*/ 8) {
    				toggle_class(div, "selected", /*selected*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			destroy_component(link);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('NavItem', slots, []);
    	let { title } = $$props;
    	let { route } = $$props;
    	let { icon = title.toLowerCase() } = $$props;
    	let selected = window.location.pathname === route;

    	pathStore.subscribe(r => {
    		$$invalidate(3, selected = r === route);
    	});

    	const writable_props = ['title', 'route', 'icon'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<NavItem> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('route' in $$props) $$invalidate(1, route = $$props.route);
    		if ('icon' in $$props) $$invalidate(2, icon = $$props.icon);
    	};

    	$$self.$capture_state = () => ({
    		Link,
    		pathStore,
    		title,
    		route,
    		icon,
    		selected
    	});

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('route' in $$props) $$invalidate(1, route = $$props.route);
    		if ('icon' in $$props) $$invalidate(2, icon = $$props.icon);
    		if ('selected' in $$props) $$invalidate(3, selected = $$props.selected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, route, icon, selected];
    }

    class NavItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$3(this, options, instance$1, create_fragment$1, safe_not_equal, { title: 0, route: 1, icon: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NavItem",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*title*/ ctx[0] === undefined && !('title' in props)) {
    			console.warn("<NavItem> was created without expected prop 'title'");
    		}

    		if (/*route*/ ctx[1] === undefined && !('route' in props)) {
    			console.warn("<NavItem> was created without expected prop 'route'");
    		}
    	}

    	get title() {
    		throw new Error("<NavItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<NavItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get route() {
    		throw new Error("<NavItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set route(value) {
    		throw new Error("<NavItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<NavItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<NavItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.49.0 */
    const file = "src\\App.svelte";

    // (35:24) <Route path="/">
    function create_default_slot_1(ctx) {
    	let home;
    	let current;
    	home = new Home({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(home.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(home, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(home.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(home.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(home, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(35:24) <Route path=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (21:12) <Router {url}>
    function create_default_slot(ctx) {
    	let div0;
    	let nav;
    	let navitem0;
    	let t0;
    	let navitem1;
    	let t1;
    	let navitem2;
    	let t2;
    	let navitem3;
    	let t3;
    	let div2;
    	let div1;
    	let route0;
    	let t4;
    	let route1;
    	let t5;
    	let route2;
    	let t6;
    	let route3;
    	let current;

    	navitem0 = new NavItem({
    			props: { icon: "home", title: "Home", route: "/" },
    			$$inline: true
    		});

    	navitem1 = new NavItem({
    			props: {
    				icon: "pencil",
    				title: "Editor",
    				route: "/editor"
    			},
    			$$inline: true
    		});

    	navitem2 = new NavItem({
    			props: {
    				icon: "book",
    				title: "Lexicon",
    				route: "/lexicon"
    			},
    			$$inline: true
    		});

    	navitem3 = new NavItem({
    			props: {
    				icon: "question",
    				title: "About",
    				route: "/about"
    			},
    			$$inline: true
    		});

    	route0 = new Route({
    			props: { path: "editor", component: Editor_1 },
    			$$inline: true
    		});

    	route1 = new Route({
    			props: { path: "about", component: About },
    			$$inline: true
    		});

    	route2 = new Route({
    			props: { path: "lexicon", component: Lexicon },
    			$$inline: true
    		});

    	route3 = new Route({
    			props: {
    				path: "/",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			nav = element("nav");
    			create_component(navitem0.$$.fragment);
    			t0 = space();
    			create_component(navitem1.$$.fragment);
    			t1 = space();
    			create_component(navitem2.$$.fragment);
    			t2 = space();
    			create_component(navitem3.$$.fragment);
    			t3 = space();
    			div2 = element("div");
    			div1 = element("div");
    			create_component(route0.$$.fragment);
    			t4 = space();
    			create_component(route1.$$.fragment);
    			t5 = space();
    			create_component(route2.$$.fragment);
    			t6 = space();
    			create_component(route3.$$.fragment);
    			add_location(nav, file, 22, 20, 727);
    			attr_dev(div0, "class", "navigation");
    			add_location(div0, file, 21, 16, 681);
    			attr_dev(div1, "class", "main-container");
    			add_location(div1, file, 30, 20, 1164);
    			attr_dev(div2, "class", "main-content");
    			add_location(div2, file, 29, 16, 1116);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, nav);
    			mount_component(navitem0, nav, null);
    			append_dev(nav, t0);
    			mount_component(navitem1, nav, null);
    			append_dev(nav, t1);
    			mount_component(navitem2, nav, null);
    			append_dev(nav, t2);
    			mount_component(navitem3, nav, null);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			mount_component(route0, div1, null);
    			append_dev(div1, t4);
    			mount_component(route1, div1, null);
    			append_dev(div1, t5);
    			mount_component(route2, div1, null);
    			append_dev(div1, t6);
    			mount_component(route3, div1, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route3_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route3_changes.$$scope = { dirty, ctx };
    			}

    			route3.$set(route3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navitem0.$$.fragment, local);
    			transition_in(navitem1.$$.fragment, local);
    			transition_in(navitem2.$$.fragment, local);
    			transition_in(navitem3.$$.fragment, local);
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			transition_in(route2.$$.fragment, local);
    			transition_in(route3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navitem0.$$.fragment, local);
    			transition_out(navitem1.$$.fragment, local);
    			transition_out(navitem2.$$.fragment, local);
    			transition_out(navitem3.$$.fragment, local);
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(route2.$$.fragment, local);
    			transition_out(route3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_component(navitem0);
    			destroy_component(navitem1);
    			destroy_component(navitem2);
    			destroy_component(navitem3);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div2);
    			destroy_component(route0);
    			destroy_component(route1);
    			destroy_component(route2);
    			destroy_component(route3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(21:12) <Router {url}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let div3;
    	let div0;
    	let t1;
    	let div1;
    	let router;
    	let t2;
    	let div2;
    	let t4;
    	let modals;
    	let current;

    	router = new Router({
    			props: {
    				url: /*url*/ ctx[0],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	modals = new Modals({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			div3 = element("div");
    			div0 = element("div");
    			div0.textContent = "Header";
    			t1 = space();
    			div1 = element("div");
    			create_component(router.$$.fragment);
    			t2 = space();
    			div2 = element("div");
    			div2.textContent = "Footer";
    			t4 = space();
    			create_component(modals.$$.fragment);
    			attr_dev(div0, "class", "root header");
    			add_location(div0, file, 16, 8, 539);
    			attr_dev(div1, "class", "root middle");
    			add_location(div1, file, 19, 8, 610);
    			attr_dev(div2, "class", "root footer");
    			add_location(div2, file, 41, 8, 1607);
    			attr_dev(div3, "class", "container");
    			add_location(div3, file, 15, 4, 506);
    			add_location(main, file, 14, 0, 494);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div3);
    			append_dev(div3, div0);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			mount_component(router, div1, null);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div3, t4);
    			mount_component(modals, div3, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const router_changes = {};
    			if (dirty & /*url*/ 1) router_changes.url = /*url*/ ctx[0];

    			if (dirty & /*$$scope*/ 2) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			transition_in(modals.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			transition_out(modals.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(router);
    			destroy_component(modals);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let { url = "" } = $$props;
    	init$1();
    	const writable_props = ['url'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('url' in $$props) $$invalidate(0, url = $$props.url);
    	};

    	$$self.$capture_state = () => ({
    		Router,
    		Link,
    		Route,
    		Home,
    		About,
    		Editor: Editor_1,
    		Lexicon,
    		Modals,
    		NavItem,
    		initLocationService: init$1,
    		url
    	});

    	$$self.$inject_state = $$props => {
    		if ('url' in $$props) $$invalidate(0, url = $$props.url);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [url];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$3(this, options, instance, create_fragment, safe_not_equal, { url: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get url() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const tokenizer = {
        keywords: [
            "record",
            "choice",
            "data",
            "open",
        ],
        autoClosingPairs: [{ open: "{", close: "}" }],
        digits: /\d+(_+\d+)*/,

        tokenizer: {
            root: [
                { include: 'whitespace' },
                { include: "code_block" },
                { include: "chapter" },
                { include: "annotation" },
                { include: "directive" },
                { include: "lang" },
            ],
            whitespace: [
                [/[ \t\r\n]+/, 'white']
            ],
            chapter: [[/#.*/, "chapter"]],
            annotation: [[/@.*/, "annotation"]],
            code_block: [
                [/^`{3}/, { token: "nothing", next: "@code_block_internal" }]
            ],
            code_block_internal: [
                [/^`{3}/, { token: "nothing", next: "@pop" }]
            ],
            directive: [
                [/(%)([^:]+)/, ["number", "type.identifier"]]
            ],
            lang: [
                // [/({)([a-zA-Z0-9]+)(\.)([a-zA-Z0-9]+)(})/, ["chapter", "type.identifier", "chapter", "annotation.field", "chapter"]],
                [/^([a-z][^ ]*)/, [
                    {
                        cases: {
                            // language
                            "open": { token: "keyword" },
                            "record": { token: "keyword", next: "@record" },
                            "type": { token: "keyword", next: "@type" },
                            "choice": { token: "keyword", next: "@choice" },
                            "data": { token: "keyword", next: "@data" },

                            // document
                            "view": { token: "keyword", next: "@view" },
                            "guideline": { token: "keyword", next: "@attributes" },
                            "requirement": { token: "keyword", next: "@attributes" },
                            "include": { token: "keyword", next: "@field" },

                            // planning
                            "roadmap": { token: "keyword", next: "@attributes" },
                            "task": { token: "keyword", next: "@attributes" },
                            "milestone": { token: "keyword", next: "@attributes" },


                            // flows 
                            "flow": { token: "keyword", next: "@attributes" },

                            // architecture
                            "component": { token: "keyword", next: "@attributes" },
                            "interaction": { token: "keyword", next: "@attributes" },
                            "person": { token: "keyword", next: "@attributes" },
                            "system": { token: "keyword", next: "@attributes" },
                            "endpoint": { token: "keyword", next: "@attributes_endpoint" },
                        }
                    }]]
            ],
            record: [
                [/extends/, "keyword"],
                [/=/, "number", "@field"],
                [/'[a-z]/, "generic-parameter"], // generic types
                { include: "lang" }
            ],
            view: [
                [/view/, "keyword"],
                { include: "lang" },
                { include: "root" },
            ],
            type: [
                [/->/, "number"],
                [/;/, "number", "@root"],
                [/'[a-z]/, "generic-parameter"], // generic types
                { include: "lang" }
            ],
            choice: [
                [/(|)\w*(")/, ["number", { token: 'string.quote', bracket: '@open', next: '@string' }]],
                { include: "root" },
                { include: "lang" }
            ],
            data: [
                [/'[a-z]/, "generic-parameter"], // generic types
                { include: "root" },
                { include: "lang" }
            ],
            field: [
                [/\d+/, "number"],
                [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
                [/'[a-z]/, "generic-parameter"], // generic types
                { include: "root" },
                { include: "lang" }
            ],
            attributes: [
                [/([A-Z][a-zA-Z0-9_]*)(:)/, ["type.identifier", "number"]],
                { include: "lang" },
                { include: "root" },
            ],
            attributes_endpoint: [
                [/->/, "number"],
                [/([A-Z][a-zA-Z ]*)(::)/, ["nothing", "number"]],
                [/([A-Z][a-zA-Z ]*)(:)/, ["type.identifier", "number"]],
                { include: "lang" }
            ],
            decode_type: [
                [/(List)([^;]*)(;)/, ["type.identifier", "", "number"]],
                [/(Maybe)([^;]*)(;)/, ["type.identifier", "", "number"], "@field"],
                { include: "lang" }
            ],
            string: [
                [/[^\\"]+/, 'string'],
                [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
            ],
            comment: [
                [/[^\*}]+/, 'comment'],
                [/\{\*/, 'comment', '@push'],    // nested comment
                ["\\*}", 'comment', '@pop'],
                [/[\{\*]/, 'comment']
            ]
        }
    };

    const theme = {
        base: "vs-dark",
        inherit: true,
        colors: {
            "editor.background": "#212121",
            "minimap.background": "#212121"
        },
        rules: [
            { token: "chapter", foreground: "#ea5dd5" },
            { token: "annotation", foreground: "#cd9394" },
            { token: "identifier", foreground: "#00aa9e" },
            { token: "basetype", foreground: "#fdf8ea" },
            { token: "generic-parameter", foreground: "#ea5dd5" },
            { token: "annotation.field", foreground: "#ffffff" },
        ]
    };

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    var keypress = createCommonjsModule(function (module, exports) {
    // Generated by CoffeeScript 1.8.0

    /*
    Copyright 2014 David Mauro
    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
    Keypress is a robust keyboard input capturing Javascript utility
    focused on input for games.
    version 2.1.5
     */


    /*
    Combo options available and their defaults:
        keys                  : []            - An array of the keys pressed together to activate combo.
        count                 : 0             - The number of times a counting combo has been pressed. Reset on release.
        is_unordered          : false         - Unless this is set to true, the keys can be pressed down in any order.
        is_counting           : false         - Makes this a counting combo (see documentation).
        is_exclusive          : false         - This combo will replace other exclusive combos when true.
        is_solitary           : false         - This combo will only fire if ONLY it's keys are pressed down.
        is_sequence           : false         - Rather than a key combo, this is an ordered key sequence.
        prevent_default       : false         - Prevent default behavior for all component key keypresses.
        prevent_repeat        : false         - Prevent the combo from repeating when keydown is held.
        normalize_caps_lock   : false         - Do not allow turning caps lock on to prevent combos from being activated.
        on_keydown            : null          - A function that is called when the combo is pressed.
        on_keyup              : null          - A function that is called when the combo is released.
        on_release            : null          - A function that is called when all keys in the combo are released.
        this                  : undefined     - Defines the scope for your callback functions.
     */

    (function () {
        var Combo, keypress, _change_keycodes_by_browser, _compare_arrays, _compare_arrays_sorted, _convert_key_to_readable, _convert_to_shifted_key, _decide_meta_key, _factory_defaults, _filter_array, _index_of_in_array, _is_array_in_array, _is_array_in_array_sorted, _key_is_valid, _keycode_alternate_names, _keycode_dictionary, _keycode_shifted_keys, _log_error, _metakey, _modifier_event_mapping, _modifier_keys, _validate_combo,
            __hasProp = {}.hasOwnProperty,
            __indexOf = [].indexOf || function (item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

        _factory_defaults = {
            is_unordered: false,
            is_counting: false,
            is_exclusive: false,
            is_solitary: false,
            prevent_default: false,
            prevent_repeat: false,
            normalize_caps_lock: false
        };

        _modifier_keys = ["meta", "alt", "option", "ctrl", "shift", "cmd"];

        _metakey = "ctrl";

        keypress = {};

        keypress.debug = false;

        Combo = (function () {
            function Combo(dictionary) {
                var property, value;
                for (property in dictionary) {
                    if (!__hasProp.call(dictionary, property)) continue;
                    value = dictionary[property];
                    if (value !== false) {
                        this[property] = value;
                    }
                }
                this.keys = this.keys || [];
                this.count = this.count || 0;
            }

            Combo.prototype.allows_key_repeat = function () {
                return !this.prevent_repeat && typeof this.on_keydown === "function";
            };

            Combo.prototype.reset = function () {
                this.count = 0;
                return this.keyup_fired = null;
            };

            return Combo;

        })();

        keypress.Listener = (function () {
            function Listener(element, defaults) {
                var attach_handler, property, value;
                if ((typeof jQuery !== "undefined" && jQuery !== null) && element instanceof jQuery) {
                    if (element.length !== 1) {
                        _log_error("Warning: your jQuery selector should have exactly one object.");
                    }
                    element = element[0];
                }
                this.should_suppress_event_defaults = false;
                this.should_force_event_defaults = false;
                this.sequence_delay = 800;
                this._registered_combos = [];
                this._keys_down = [];
                this._active_combos = [];
                this._sequence = [];
                this._sequence_timer = null;
                this._prevent_capture = false;
                this._defaults = defaults || {};
                for (property in _factory_defaults) {
                    if (!__hasProp.call(_factory_defaults, property)) continue;
                    value = _factory_defaults[property];
                    this._defaults[property] = this._defaults[property] || value;
                }
                this.element = element || document.body;
                attach_handler = function (target, event, handler) {
                    if (target.addEventListener) {
                        target.addEventListener(event, handler);
                    } else if (target.attachEvent) {
                        target.attachEvent("on" + event, handler);
                    }
                    return handler;
                };
                this.keydown_event = attach_handler(this.element, "keydown", (function (_this) {
                    return function (e) {
                        e = e || window.event;
                        _this._receive_input(e, true);
                        return _this._bug_catcher(e);
                    };
                })(this));
                this.keyup_event = attach_handler(this.element, "keyup", (function (_this) {
                    return function (e) {
                        e = e || window.event;
                        return _this._receive_input(e, false);
                    };
                })(this));
                this.blur_event = attach_handler(window, "blur", (function (_this) {
                    return function () {
                        var key, _i, _len, _ref;
                        _ref = _this._keys_down;
                        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                            key = _ref[_i];
                            _this._key_up(key, {});
                        }
                        return _this._keys_down = [];
                    };
                })(this));
            }

            Listener.prototype.destroy = function () {
                var remove_handler;
                remove_handler = function (target, event, handler) {
                    if (target.removeEventListener != null) {
                        return target.removeEventListener(event, handler);
                    } else if (target.removeEvent != null) {
                        return target.removeEvent("on" + event, handler);
                    }
                };
                remove_handler(this.element, "keydown", this.keydown_event);
                remove_handler(this.element, "keyup", this.keyup_event);
                return remove_handler(window, "blur", this.blur_event);
            };

            Listener.prototype._bug_catcher = function (e) {
                var _ref, _ref1;
                if (_metakey === "cmd" && __indexOf.call(this._keys_down, "cmd") >= 0 && ((_ref = _convert_key_to_readable((_ref1 = e.keyCode) != null ? _ref1 : e.key)) !== "cmd" && _ref !== "shift" && _ref !== "alt" && _ref !== "caps" && _ref !== "tab")) {
                    return this._receive_input(e, false);
                }
            };

            Listener.prototype._cmd_bug_check = function (combo_keys) {
                if (_metakey === "cmd" && __indexOf.call(this._keys_down, "cmd") >= 0 && __indexOf.call(combo_keys, "cmd") < 0) {
                    return false;
                }
                return true;
            };

            Listener.prototype._prevent_default = function (e, should_prevent) {
                if ((should_prevent || this.should_suppress_event_defaults) && !this.should_force_event_defaults) {
                    if (e.preventDefault) {
                        e.preventDefault();
                    } else {
                        e.returnValue = false;
                    }
                    if (e.stopPropagation) {
                        return e.stopPropagation();
                    }
                }
            };

            Listener.prototype._get_active_combos = function (key) {
                var active_combos, keys_down;
                active_combos = [];
                keys_down = _filter_array(this._keys_down, function (down_key) {
                    return down_key !== key;
                });
                keys_down.push(key);
                this._match_combo_arrays(keys_down, (function (_this) {
                    return function (match) {
                        if (_this._cmd_bug_check(match.keys)) {
                            return active_combos.push(match);
                        }
                    };
                })(this));
                this._fuzzy_match_combo_arrays(keys_down, (function (_this) {
                    return function (match) {
                        if (__indexOf.call(active_combos, match) >= 0) {
                            return;
                        }
                        if (!(match.is_solitary || !_this._cmd_bug_check(match.keys))) {
                            return active_combos.push(match);
                        }
                    };
                })(this));
                return active_combos;
            };

            Listener.prototype._get_potential_combos = function (key) {
                var combo, potentials, _i, _len, _ref;
                potentials = [];
                _ref = this._registered_combos;
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    combo = _ref[_i];
                    if (combo.is_sequence) {
                        continue;
                    }
                    if (__indexOf.call(combo.keys, key) >= 0 && this._cmd_bug_check(combo.keys)) {
                        potentials.push(combo);
                    }
                }
                return potentials;
            };

            Listener.prototype._add_to_active_combos = function (combo) {
                var active_combo, active_key, active_keys, already_replaced, combo_key, i, should_prepend, should_replace, _i, _j, _k, _len, _len1, _ref, _ref1;
                should_replace = false;
                should_prepend = true;
                already_replaced = false;
                if (__indexOf.call(this._active_combos, combo) >= 0) {
                    return true;
                } else if (this._active_combos.length) {
                    for (i = _i = 0, _ref = this._active_combos.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
                        active_combo = this._active_combos[i];
                        if (!(active_combo && active_combo.is_exclusive && combo.is_exclusive)) {
                            continue;
                        }
                        active_keys = active_combo.keys;
                        if (!should_replace) {
                            for (_j = 0, _len = active_keys.length; _j < _len; _j++) {
                                active_key = active_keys[_j];
                                should_replace = true;
                                if (__indexOf.call(combo.keys, active_key) < 0) {
                                    should_replace = false;
                                    break;
                                }
                            }
                        }
                        if (should_prepend && !should_replace) {
                            _ref1 = combo.keys;
                            for (_k = 0, _len1 = _ref1.length; _k < _len1; _k++) {
                                combo_key = _ref1[_k];
                                should_prepend = false;
                                if (__indexOf.call(active_keys, combo_key) < 0) {
                                    should_prepend = true;
                                    break;
                                }
                            }
                        }
                        if (should_replace) {
                            if (already_replaced) {
                                active_combo = this._active_combos.splice(i, 1)[0];
                                if (active_combo != null) {
                                    active_combo.reset();
                                }
                            } else {
                                active_combo = this._active_combos.splice(i, 1, combo)[0];
                                if (active_combo != null) {
                                    active_combo.reset();
                                }
                                already_replaced = true;
                            }
                            should_prepend = false;
                        }
                    }
                }
                if (should_prepend) {
                    this._active_combos.unshift(combo);
                }
                return should_replace || should_prepend;
            };

            Listener.prototype._remove_from_active_combos = function (combo) {
                var active_combo, i, _i, _ref;
                for (i = _i = 0, _ref = this._active_combos.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
                    active_combo = this._active_combos[i];
                    if (active_combo === combo) {
                        combo = this._active_combos.splice(i, 1)[0];
                        combo.reset();
                        break;
                    }
                }
            };

            Listener.prototype._get_possible_sequences = function () {
                var combo, i, j, match, matches, sequence, _i, _j, _k, _len, _ref, _ref1, _ref2;
                matches = [];
                _ref = this._registered_combos;
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    combo = _ref[_i];
                    for (j = _j = 1, _ref1 = this._sequence.length; 1 <= _ref1 ? _j <= _ref1 : _j >= _ref1; j = 1 <= _ref1 ? ++_j : --_j) {
                        sequence = this._sequence.slice(-j);
                        if (!combo.is_sequence) {
                            continue;
                        }
                        if (__indexOf.call(combo.keys, "shift") < 0) {
                            sequence = _filter_array(sequence, function (key) {
                                return key !== "shift";
                            });
                            if (!sequence.length) {
                                continue;
                            }
                        }
                        for (i = _k = 0, _ref2 = sequence.length; 0 <= _ref2 ? _k < _ref2 : _k > _ref2; i = 0 <= _ref2 ? ++_k : --_k) {
                            if (combo.keys[i] === sequence[i]) {
                                match = true;
                            } else {
                                match = false;
                                break;
                            }
                        }
                        if (match) {
                            matches.push(combo);
                        }
                    }
                }
                return matches;
            };

            Listener.prototype._add_key_to_sequence = function (key, e) {
                var combo, sequence_combos, _i, _len;
                this._sequence.push(key);
                sequence_combos = this._get_possible_sequences();
                if (sequence_combos.length) {
                    for (_i = 0, _len = sequence_combos.length; _i < _len; _i++) {
                        combo = sequence_combos[_i];
                        this._prevent_default(e, combo.prevent_default);
                    }
                    if (this._sequence_timer) {
                        clearTimeout(this._sequence_timer);
                    }
                    if (this.sequence_delay > -1) {
                        this._sequence_timer = setTimeout((function (_this) {
                            return function () {
                                return _this._sequence = [];
                            };
                        })(this), this.sequence_delay);
                    }
                } else {
                    this._sequence = [];
                }
            };

            Listener.prototype._get_sequence = function (key) {
                var combo, i, j, match, seq_key, sequence, _i, _j, _k, _len, _ref, _ref1, _ref2;
                _ref = this._registered_combos;
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    combo = _ref[_i];
                    if (!combo.is_sequence) {
                        continue;
                    }
                    for (j = _j = 1, _ref1 = this._sequence.length; 1 <= _ref1 ? _j <= _ref1 : _j >= _ref1; j = 1 <= _ref1 ? ++_j : --_j) {
                        sequence = (_filter_array(this._sequence, function (seq_key) {
                            if (__indexOf.call(combo.keys, "shift") >= 0) {
                                return true;
                            }
                            return seq_key !== "shift";
                        })).slice(-j);
                        if (combo.keys.length !== sequence.length) {
                            continue;
                        }
                        for (i = _k = 0, _ref2 = sequence.length; 0 <= _ref2 ? _k < _ref2 : _k > _ref2; i = 0 <= _ref2 ? ++_k : --_k) {
                            seq_key = sequence[i];
                            if (__indexOf.call(combo.keys, "shift") < 0) {
                                if (seq_key === "shift") {
                                    continue;
                                }
                            }
                            if (key === "shift" && __indexOf.call(combo.keys, "shift") < 0) {
                                continue;
                            }
                            if (combo.keys[i] === seq_key) {
                                match = true;
                            } else {
                                match = false;
                                break;
                            }
                        }
                    }
                    if (match) {
                        if (combo.is_exclusive) {
                            this._sequence = [];
                        }
                        return combo;
                    }
                }
                return false;
            };

            Listener.prototype._receive_input = function (e, is_keydown) {
                var key, _ref;
                if (this._prevent_capture) {
                    if (this._keys_down.length) {
                        this._keys_down = [];
                    }
                    return;
                }
                key = _convert_key_to_readable((_ref = e.keyCode) != null ? _ref : e.key);
                if (!is_keydown && !this._keys_down.length && (key === "alt" || key === _metakey)) {
                    return;
                }
                if (!key) {
                    return;
                }
                if (is_keydown) {
                    return this._key_down(key, e);
                } else {
                    return this._key_up(key, e);
                }
            };

            Listener.prototype._fire = function (event, combo, key_event, is_autorepeat) {
                if (typeof combo["on_" + event] === "function") {
                    this._prevent_default(key_event, combo["on_" + event].call(combo["this"], key_event, combo.count, is_autorepeat) !== true);
                }
                if (event === "release") {
                    combo.count = 0;
                }
                if (event === "keyup") {
                    return combo.keyup_fired = true;
                }
            };

            Listener.prototype._match_combo_arrays = function (potential_match, match_handler) {
                var combo_potential_match, source_combo, _i, _len, _ref;
                _ref = this._registered_combos;
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    source_combo = _ref[_i];
                    combo_potential_match = potential_match.slice(0);
                    if (source_combo.normalize_caps_lock && __indexOf.call(combo_potential_match, "caps") >= 0) {
                        combo_potential_match.splice(combo_potential_match.indexOf("caps"), 1);
                    }
                    if ((!source_combo.is_unordered && _compare_arrays_sorted(combo_potential_match, source_combo.keys)) || (source_combo.is_unordered && _compare_arrays(combo_potential_match, source_combo.keys))) {
                        match_handler(source_combo);
                    }
                }
            };

            Listener.prototype._fuzzy_match_combo_arrays = function (potential_match, match_handler) {
                var source_combo, _i, _len, _ref;
                _ref = this._registered_combos;
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    source_combo = _ref[_i];
                    if ((!source_combo.is_unordered && _is_array_in_array_sorted(source_combo.keys, potential_match)) || (source_combo.is_unordered && _is_array_in_array(source_combo.keys, potential_match))) {
                        match_handler(source_combo);
                    }
                }
            };

            Listener.prototype._keys_remain = function (combo) {
                var key, keys_remain, _i, _len, _ref;
                _ref = combo.keys;
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    key = _ref[_i];
                    if (__indexOf.call(this._keys_down, key) >= 0) {
                        keys_remain = true;
                        break;
                    }
                }
                return keys_remain;
            };

            Listener.prototype._key_down = function (key, e) {
                var combo, combos, event_mod, i, mod, potential, potential_combos, sequence_combo, shifted_key, _i, _j, _k, _len, _len1, _ref;
                shifted_key = _convert_to_shifted_key(key, e);
                if (shifted_key) {
                    key = shifted_key;
                }
                this._add_key_to_sequence(key, e);
                sequence_combo = this._get_sequence(key);
                if (sequence_combo) {
                    this._fire("keydown", sequence_combo, e);
                }
                for (mod in _modifier_event_mapping) {
                    event_mod = _modifier_event_mapping[mod];
                    if (!e[event_mod]) {
                        continue;
                    }
                    if (mod === key || __indexOf.call(this._keys_down, mod) >= 0) {
                        continue;
                    }
                    this._keys_down.push(mod);
                }
                for (mod in _modifier_event_mapping) {
                    event_mod = _modifier_event_mapping[mod];
                    if (mod === key) {
                        continue;
                    }
                    if (__indexOf.call(this._keys_down, mod) >= 0 && !e[event_mod]) {
                        if (mod === "cmd" && _metakey !== "cmd") {
                            continue;
                        }
                        for (i = _i = 0, _ref = this._keys_down.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
                            if (this._keys_down[i] === mod) {
                                this._keys_down.splice(i, 1);
                            }
                        }
                    }
                }
                combos = this._get_active_combos(key);
                potential_combos = this._get_potential_combos(key);
                for (_j = 0, _len = combos.length; _j < _len; _j++) {
                    combo = combos[_j];
                    this._handle_combo_down(combo, potential_combos, key, e);
                }
                if (potential_combos.length) {
                    for (_k = 0, _len1 = potential_combos.length; _k < _len1; _k++) {
                        potential = potential_combos[_k];
                        this._prevent_default(e, potential.prevent_default);
                    }
                }
                if (__indexOf.call(this._keys_down, key) < 0) {
                    this._keys_down.push(key);
                }
            };

            Listener.prototype._handle_combo_down = function (combo, potential_combos, key, e) {
                var is_autorepeat, is_other_exclusive, potential_combo, result, _i, _len;
                if (__indexOf.call(combo.keys, key) < 0) {
                    return false;
                }
                this._prevent_default(e, combo && combo.prevent_default);
                is_autorepeat = false;
                if (__indexOf.call(this._keys_down, key) >= 0) {
                    is_autorepeat = true;
                    if (!combo.allows_key_repeat()) {
                        return false;
                    }
                }
                result = this._add_to_active_combos(combo, key);
                combo.keyup_fired = false;
                is_other_exclusive = false;
                if (combo.is_exclusive) {
                    for (_i = 0, _len = potential_combos.length; _i < _len; _i++) {
                        potential_combo = potential_combos[_i];
                        if (potential_combo.is_exclusive && potential_combo.keys.length > combo.keys.length) {
                            is_other_exclusive = true;
                            break;
                        }
                    }
                }
                if (!is_other_exclusive) {
                    if (combo.is_counting && typeof combo.on_keydown === "function") {
                        combo.count += 1;
                    }
                    if (result) {
                        return this._fire("keydown", combo, e, is_autorepeat);
                    }
                }
            };

            Listener.prototype._key_up = function (key, e) {
                var active_combo, active_combos_length, combo, combos, i, sequence_combo, shifted_key, unshifted_key, _i, _j, _k, _l, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3;
                unshifted_key = key;
                shifted_key = _convert_to_shifted_key(key, e);
                if (shifted_key) {
                    key = shifted_key;
                }
                shifted_key = _keycode_shifted_keys[unshifted_key];
                if (e.shiftKey) {
                    if (!(shifted_key && __indexOf.call(this._keys_down, shifted_key) >= 0)) {
                        key = unshifted_key;
                    }
                } else {
                    if (!(unshifted_key && __indexOf.call(this._keys_down, unshifted_key) >= 0)) {
                        key = shifted_key;
                    }
                }
                sequence_combo = this._get_sequence(key);
                if (sequence_combo) {
                    this._fire("keyup", sequence_combo, e);
                }
                if (__indexOf.call(this._keys_down, key) < 0) {
                    return false;
                }
                for (i = _i = 0, _ref = this._keys_down.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
                    if ((_ref1 = this._keys_down[i]) === key || _ref1 === shifted_key || _ref1 === unshifted_key) {
                        this._keys_down.splice(i, 1);
                        break;
                    }
                }
                active_combos_length = this._active_combos.length;
                combos = [];
                _ref2 = this._active_combos;
                for (_j = 0, _len = _ref2.length; _j < _len; _j++) {
                    active_combo = _ref2[_j];
                    if (__indexOf.call(active_combo.keys, key) >= 0) {
                        combos.push(active_combo);
                    }
                }
                for (_k = 0, _len1 = combos.length; _k < _len1; _k++) {
                    combo = combos[_k];
                    this._handle_combo_up(combo, e, key);
                }
                if (active_combos_length > 1) {
                    _ref3 = this._active_combos;
                    for (_l = 0, _len2 = _ref3.length; _l < _len2; _l++) {
                        active_combo = _ref3[_l];
                        if (active_combo === void 0 || __indexOf.call(combos, active_combo) >= 0) {
                            continue;
                        }
                        if (!this._keys_remain(active_combo)) {
                            this._remove_from_active_combos(active_combo);
                        }
                    }
                }
            };

            Listener.prototype._handle_combo_up = function (combo, e, key) {
                var keys_down, keys_remaining;
                this._prevent_default(e, combo && combo.prevent_default);
                keys_remaining = this._keys_remain(combo);
                if (!combo.keyup_fired) {
                    keys_down = this._keys_down.slice();
                    keys_down.push(key);
                    if (!combo.is_solitary || _compare_arrays(keys_down, combo.keys)) {
                        this._fire("keyup", combo, e);
                        if (combo.is_counting && typeof combo.on_keyup === "function" && typeof combo.on_keydown !== "function") {
                            combo.count += 1;
                        }
                    }
                }
                if (!keys_remaining) {
                    this._fire("release", combo, e);
                    this._remove_from_active_combos(combo);
                }
            };

            Listener.prototype.simple_combo = function (keys, callback) {
                return this.register_combo({
                    keys: keys,
                    on_keydown: callback
                });
            };

            Listener.prototype.counting_combo = function (keys, count_callback) {
                return this.register_combo({
                    keys: keys,
                    is_counting: true,
                    is_unordered: false,
                    on_keydown: count_callback
                });
            };

            Listener.prototype.sequence_combo = function (keys, callback) {
                return this.register_combo({
                    keys: keys,
                    on_keydown: callback,
                    is_sequence: true,
                    is_exclusive: true
                });
            };

            Listener.prototype.register_combo = function (combo_dictionary) {
                var combo, property, value, _ref;
                if (typeof combo_dictionary["keys"] === "string") {
                    combo_dictionary["keys"] = combo_dictionary["keys"].split(" ");
                }
                _ref = this._defaults;
                for (property in _ref) {
                    if (!__hasProp.call(_ref, property)) continue;
                    value = _ref[property];
                    if (combo_dictionary[property] === void 0) {
                        combo_dictionary[property] = value;
                    }
                }
                combo = new Combo(combo_dictionary);
                if (_validate_combo(combo)) {
                    this._registered_combos.push(combo);
                    return combo;
                }
            };

            Listener.prototype.register_many = function (combo_array) {
                var combo, _i, _len, _results;
                _results = [];
                for (_i = 0, _len = combo_array.length; _i < _len; _i++) {
                    combo = combo_array[_i];
                    _results.push(this.register_combo(combo));
                }
                return _results;
            };

            Listener.prototype.unregister_combo = function (keys_or_combo) {
                var combo, i, unregister_combo, _i, _j, _len, _ref, _ref1, _results;
                if (!keys_or_combo) {
                    return false;
                }
                unregister_combo = (function (_this) {
                    return function (combo) {
                        var i, _i, _ref, _results;
                        _results = [];
                        for (i = _i = 0, _ref = _this._registered_combos.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
                            if (combo === _this._registered_combos[i]) {
                                _this._registered_combos.splice(i, 1);
                                break;
                            } else {
                                _results.push(void 0);
                            }
                        }
                        return _results;
                    };
                })(this);
                if (keys_or_combo instanceof Combo) {
                    return unregister_combo(keys_or_combo);
                } else {
                    if (typeof keys_or_combo === "string") {
                        keys_or_combo = keys_or_combo.split(" ");
                        for (i = _i = 0, _ref = keys_or_combo.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
                            if (keys_or_combo[i] === "meta") {
                                keys_or_combo[i] = _metakey;
                            }
                        }
                    }
                    _ref1 = this._registered_combos;
                    _results = [];
                    for (_j = 0, _len = _ref1.length; _j < _len; _j++) {
                        combo = _ref1[_j];
                        if (combo == null) {
                            continue;
                        }
                        if ((combo.is_unordered && _compare_arrays(keys_or_combo, combo.keys)) || (!combo.is_unordered && _compare_arrays_sorted(keys_or_combo, combo.keys))) {
                            _results.push(unregister_combo(combo));
                        } else {
                            _results.push(void 0);
                        }
                    }
                    return _results;
                }
            };

            Listener.prototype.unregister_many = function (combo_array) {
                var combo, _i, _len, _results;
                _results = [];
                for (_i = 0, _len = combo_array.length; _i < _len; _i++) {
                    combo = combo_array[_i];
                    _results.push(this.unregister_combo(combo));
                }
                return _results;
            };

            Listener.prototype.get_registered_combos = function () {
                return this._registered_combos;
            };

            Listener.prototype.reset = function () {
                return this._registered_combos = [];
            };

            Listener.prototype.listen = function () {
                return this._prevent_capture = false;
            };

            Listener.prototype.stop_listening = function () {
                return this._prevent_capture = true;
            };

            Listener.prototype.get_meta_key = function () {
                return _metakey;
            };

            return Listener;

        })();

        _decide_meta_key = function () {
            if (navigator.userAgent.indexOf("Mac OS X") !== -1) {
                _metakey = "cmd";
            }
        };

        _change_keycodes_by_browser = function () {
            if (navigator.userAgent.indexOf("Opera") !== -1) {
                _keycode_dictionary["17"] = "cmd";
            }
        };

        _convert_key_to_readable = function (k) {
            return _keycode_dictionary[k];
        };

        _filter_array = function (array, callback) {
            var element;
            if (array.filter) {
                return array.filter(callback);
            } else {
                return (function () {
                    var _i, _len, _results;
                    _results = [];
                    for (_i = 0, _len = array.length; _i < _len; _i++) {
                        element = array[_i];
                        if (callback(element)) {
                            _results.push(element);
                        }
                    }
                    return _results;
                })();
            }
        };

        _compare_arrays = function (a1, a2) {
            var item, _i, _len;
            if (a1.length !== a2.length) {
                return false;
            }
            for (_i = 0, _len = a1.length; _i < _len; _i++) {
                item = a1[_i];
                if (__indexOf.call(a2, item) >= 0) {
                    continue;
                }
                return false;
            }
            return true;
        };

        _compare_arrays_sorted = function (a1, a2) {
            var i, _i, _ref;
            if (a1.length !== a2.length) {
                return false;
            }
            for (i = _i = 0, _ref = a1.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
                if (a1[i] !== a2[i]) {
                    return false;
                }
            }
            return true;
        };

        _is_array_in_array = function (a1, a2) {
            var item, _i, _len;
            for (_i = 0, _len = a1.length; _i < _len; _i++) {
                item = a1[_i];
                if (__indexOf.call(a2, item) < 0) {
                    return false;
                }
            }
            return true;
        };

        _index_of_in_array = Array.prototype.indexOf || function (a, item) {
            var i, _i, _ref;
            for (i = _i = 0, _ref = a.length; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
                if (a[i] === item) {
                    return i;
                }
            }
            return -1;
        };

        _is_array_in_array_sorted = function (a1, a2) {
            var index, item, prev, _i, _len;
            prev = 0;
            for (_i = 0, _len = a1.length; _i < _len; _i++) {
                item = a1[_i];
                index = _index_of_in_array.call(a2, item);
                if (index >= prev) {
                    prev = index;
                } else {
                    return false;
                }
            }
            return true;
        };

        _log_error = function () {
            if (keypress.debug) {
                return console.log.apply(console, arguments);
            }
        };

        _key_is_valid = function (key) {
            var valid, valid_key, _;
            valid = false;
            for (_ in _keycode_dictionary) {
                valid_key = _keycode_dictionary[_];
                if (key === valid_key) {
                    valid = true;
                    break;
                }
            }
            if (!valid) {
                for (_ in _keycode_shifted_keys) {
                    valid_key = _keycode_shifted_keys[_];
                    if (key === valid_key) {
                        valid = true;
                        break;
                    }
                }
            }
            return valid;
        };

        _validate_combo = function (combo) {
            var alt_name, i, key, mod_key, non_modifier_keys, property, validated, _i, _j, _k, _len, _len1, _ref, _ref1;
            validated = true;
            if (!combo.keys.length) {
                _log_error("You're trying to bind a combo with no keys:", combo);
            }
            for (i = _i = 0, _ref = combo.keys.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
                key = combo.keys[i];
                alt_name = _keycode_alternate_names[key];
                if (alt_name) {
                    key = combo.keys[i] = alt_name;
                }
                if (key === "meta") {
                    combo.keys.splice(i, 1, _metakey);
                }
                if (key === "cmd") {
                    _log_error("Warning: use the \"meta\" key rather than \"cmd\" for Windows compatibility");
                }
            }
            _ref1 = combo.keys;
            for (_j = 0, _len = _ref1.length; _j < _len; _j++) {
                key = _ref1[_j];
                if (!_key_is_valid(key)) {
                    _log_error("Do not recognize the key \"" + key + "\"");
                    validated = false;
                }
            }
            if (__indexOf.call(combo.keys, "meta") >= 0 || __indexOf.call(combo.keys, "cmd") >= 0) {
                non_modifier_keys = combo.keys.slice();
                for (_k = 0, _len1 = _modifier_keys.length; _k < _len1; _k++) {
                    mod_key = _modifier_keys[_k];
                    if ((i = _index_of_in_array.call(non_modifier_keys, mod_key)) > -1) {
                        non_modifier_keys.splice(i, 1);
                    }
                }
                if (non_modifier_keys.length > 1) {
                    _log_error("META and CMD key combos cannot have more than 1 non-modifier keys", combo, non_modifier_keys);
                    validated = false;
                }
            }
            for (property in combo) {
                combo[property];
                if (_factory_defaults[property] === "undefined") {
                    _log_error("The property " + property + " is not a valid combo property. Your combo has still been registered.");
                }
            }
            return validated;
        };

        _convert_to_shifted_key = function (key, e) {
            var k;
            if (!e.shiftKey) {
                return false;
            }
            k = _keycode_shifted_keys[key];
            if (k != null) {
                return k;
            }
            return false;
        };

        _modifier_event_mapping = {
            "cmd": "metaKey",
            "ctrl": "ctrlKey",
            "shift": "shiftKey",
            "alt": "altKey"
        };

        _keycode_alternate_names = {
            "escape": "esc",
            "control": "ctrl",
            "command": "cmd",
            "break": "pause",
            "windows": "cmd",
            "option": "alt",
            "caps_lock": "caps",
            "apostrophe": "\'",
            "semicolon": ";",
            "tilde": "~",
            "accent": "`",
            "scroll_lock": "scroll",
            "num_lock": "num"
        };

        _keycode_shifted_keys = {
            "/": "?",
            ".": ">",
            ",": "<",
            "\'": "\"",
            ";": ":",
            "[": "{",
            "]": "}",
            "\\": "|",
            "`": "~",
            "=": "+",
            "-": "_",
            "1": "!",
            "2": "@",
            "3": "#",
            "4": "$",
            "5": "%",
            "6": "^",
            "7": "&",
            "8": "*",
            "9": "(",
            "0": ")"
        };

        _keycode_dictionary = {
            0: "\\",
            8: "backspace",
            9: "tab",
            12: "num",
            13: "enter",
            16: "shift",
            17: "ctrl",
            18: "alt",
            19: "pause",
            20: "caps",
            27: "esc",
            32: "space",
            33: "pageup",
            34: "pagedown",
            35: "end",
            36: "home",
            37: "left",
            38: "up",
            39: "right",
            40: "down",
            44: "print",
            45: "insert",
            46: "delete",
            48: "0",
            49: "1",
            50: "2",
            51: "3",
            52: "4",
            53: "5",
            54: "6",
            55: "7",
            56: "8",
            57: "9",
            65: "a",
            66: "b",
            67: "c",
            68: "d",
            69: "e",
            70: "f",
            71: "g",
            72: "h",
            73: "i",
            74: "j",
            75: "k",
            76: "l",
            77: "m",
            78: "n",
            79: "o",
            80: "p",
            81: "q",
            82: "r",
            83: "s",
            84: "t",
            85: "u",
            86: "v",
            87: "w",
            88: "x",
            89: "y",
            90: "z",
            91: "cmd",
            92: "cmd",
            93: "cmd",
            96: "num_0",
            97: "num_1",
            98: "num_2",
            99: "num_3",
            100: "num_4",
            101: "num_5",
            102: "num_6",
            103: "num_7",
            104: "num_8",
            105: "num_9",
            106: "num_multiply",
            107: "num_add",
            108: "num_enter",
            109: "num_subtract",
            110: "num_decimal",
            111: "num_divide",
            112: "f1",
            113: "f2",
            114: "f3",
            115: "f4",
            116: "f5",
            117: "f6",
            118: "f7",
            119: "f8",
            120: "f9",
            121: "f10",
            122: "f11",
            123: "f12",
            124: "print",
            144: "num",
            145: "scroll",
            186: ";",
            187: "=",
            188: ",",
            189: "-",
            190: ".",
            191: "/",
            192: "`",
            219: "[",
            220: "\\",
            221: "]",
            222: "\'",
            223: "`",
            224: "cmd",
            225: "alt",
            57392: "ctrl",
            63289: "num",
            59: ";",
            61: "=",
            173: "-"
        };

        keypress._keycode_dictionary = _keycode_dictionary;

        keypress._is_array_in_array_sorted = _is_array_in_array_sorted;

        _decide_meta_key();

        _change_keycodes_by_browser();

        if (exports !== null) {
            exports.keypress = keypress;
        } else {
            window.keypress = keypress;
        }

    }).call(commonjsGlobal);
    });

    function init() {
        var listener = new keypress.keypress.Listener();
        listener.simple_combo("meta s", function (e) {
            eventbus$1.broadcast(eventbus$1.EVENTS.SAVE, {});
            e.preventDefault();
            return false;
        });

        listener.simple_combo("meta p", function (e) {
            eventbus$1.broadcast("ctrl-p", {});
            e.preventDefault();
            return false;
        });

        listener.simple_combo("meta /", function (e) {
            eventbus$1.broadcast("comment", {});
            e.preventDefault();
            return false;
        });

        listener.simple_combo("f2", function (e) {
            var currentWord = window.getCurrentWord();
            if (currentWord) {
                eventbus$1.broadcast("start refactor", currentWord);
            }
            e.preventDefault();
            return false;
        });

        listener.simple_combo("f4", function (e) {
            var currentWord = window.getCurrentWord();
            if (currentWord) {
                eventbus$1.broadcast("json_schema", currentWord);
            }
            e.preventDefault();
            return false;
        });
    }

    monaco.languages.register({ id: "carlang" });
    monaco.languages.setMonarchTokensProvider("carlang", tokenizer);
    monaco.editor.defineTheme("carlangTheme", theme);
    init();
    init$2();

    const app = new App({
    	target: document.body,
    	props: {
    		
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
