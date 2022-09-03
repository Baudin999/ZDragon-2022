var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

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
    function init$2(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
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

    /* node_modules/svelte-routing/src/Router.svelte generated by Svelte v3.49.0 */

    function create_fragment$b(ctx) {
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
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
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
    		init$2(this, options, instance$b, create_fragment$b, safe_not_equal, { basepath: 3, url: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$b.name
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

    /* node_modules/svelte-routing/src/Route.svelte generated by Svelte v3.49.0 */

    const get_default_slot_changes = dirty => ({
    	params: dirty & /*routeParams*/ 4,
    	location: dirty & /*$location*/ 16
    });

    const get_default_slot_context = ctx => ({
    	params: /*routeParams*/ ctx[2],
    	location: /*$location*/ ctx[4]
    });

    // (40:0) {#if $activeRoute !== null && $activeRoute.route === route}
    function create_if_block$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$1, create_else_block$1];
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
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(40:0) {#if $activeRoute !== null && $activeRoute.route === route}",
    		ctx
    	});

    	return block;
    }

    // (43:2) {:else}
    function create_else_block$1(ctx) {
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
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(43:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (41:2) {#if component !== null}
    function create_if_block_1$1(ctx) {
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
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(41:2) {#if component !== null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[1] !== null && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[7] && create_if_block$1(ctx);

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
    		init$2(this, options, instance$a, create_fragment$a, safe_not_equal, { path: 8, component: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$a.name
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

    /* node_modules/svelte-routing/src/Link.svelte generated by Svelte v3.49.0 */
    const file$8 = "node_modules/svelte-routing/src/Link.svelte";

    function create_fragment$9(ctx) {
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
    			add_location(a, file$8, 40, 0, 1249);
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
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
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

    		init$2(this, options, instance$9, create_fragment$9, safe_not_equal, {
    			to: 7,
    			replace: 8,
    			state: 9,
    			getProps: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$9.name
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

    var eventbus$1 = new eventbus();

    const fileState = writable({
        directory: "",
        currentPath: "",
        text: "",
        files: []
    });


    function OnFileSelected(path) {
        const state = get_store_value(fileState);
        
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

    function setText(text) {
        fileState.update(state => {
            state.text = text;
            return state;
        });
    }

    function setDirectory(directory) {
        get_store_value(fileState);

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

    function init$1() {
        eventbus$1.subscribe(eventbus$1.EVENTS.SAVING, (data) => {
            console.log("Saving", data);
        });
    }

    /* src/pages/home.svelte generated by Svelte v3.49.0 */
    const file$7 = "src/pages/home.svelte";

    function create_fragment$8(ctx) {
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
    			t1 = text("Home\n\t\n\t\t");
    			input = element("input");
    			t2 = space();
    			button = element("button");
    			button.textContent = "Submit";
    			attr_dev(input, "class", "svelte-ruxzka");
    			add_location(input, file$7, 13, 2, 158);
    			add_location(button, file$7, 14, 2, 188);
    			add_location(div, file$7, 10, 0, 142);
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
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Home', slots, []);
    	let path = "";

    	const submitPath = () => {
    		setDirectory(path);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		path = this.value;
    		$$invalidate(0, path);
    	}

    	$$self.$capture_state = () => ({ setDirectory, path, submitPath });

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
    		init$2(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/pages/about.svelte generated by Svelte v3.49.0 */

    const file$6 = "src/pages/about.svelte";

    function create_fragment$7(ctx) {
    	let t0;
    	let div;

    	const block = {
    		c: function create() {
    			t0 = space();
    			div = element("div");
    			div.textContent = "About";
    			add_location(div, file$6, 0, 1, 1);
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
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('About', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$2(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/components/Editor.svelte generated by Svelte v3.49.0 */
    const file$5 = "src/components/Editor.svelte";

    function create_fragment$6(ctx) {
    	let t;
    	let div;

    	const block = {
    		c: function create() {
    			t = space();
    			div = element("div");
    			attr_dev(div, "class", "editor svelte-b3bzf");
    			attr_dev(div, "id", /*id*/ ctx[1]);
    			add_location(div, file$5, 69, 0, 1792);
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
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Editor', slots, []);
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
    		if (editor._focusTracker._hasFocus) {
    			eventbus$1.broadcast(eventbus$1.EVENTS.SAVING, editor.getValue());
    		}
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
    			if (text && editor) {
    				editor.setValue(text);
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

    		init$2(this, options, instance$6, create_fragment$6, safe_not_equal, {
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
    			id: create_fragment$6.name
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

    /* src/components/File.svelte generated by Svelte v3.49.0 */
    const file$4 = "src/components/File.svelte";

    function create_fragment$5(ctx) {
    	let t0;
    	let span;
    	let t1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			t0 = space();
    			span = element("span");
    			t1 = text(/*name*/ ctx[0]);
    			attr_dev(span, "class", "svelte-ubex4x");
    			add_location(span, file$4, 12, 0, 248);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, span, anchor);
    			append_dev(span, t1);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*selectFile*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1) set_data_dev(t1, /*name*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
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
    	let type;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('File', slots, []);
    	let { name } = $$props;
    	let { path } = $$props;

    	const selectFile = () => {
    		OnFileSelected(path);
    	};

    	const writable_props = ['name', 'path'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<File> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('path' in $$props) $$invalidate(2, path = $$props.path);
    	};

    	$$self.$capture_state = () => ({
    		OnFileSelected,
    		name,
    		path,
    		selectFile,
    		type
    	});

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('path' in $$props) $$invalidate(2, path = $$props.path);
    		if ('type' in $$props) type = $$props.type;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*name*/ 1) {
    			type = name.slice(name.lastIndexOf('.') + 1);
    		}
    	};

    	return [name, selectFile, path];
    }

    class File extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$2(this, options, instance$5, create_fragment$5, safe_not_equal, { name: 0, path: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "File",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !('name' in props)) {
    			console.warn("<File> was created without expected prop 'name'");
    		}

    		if (/*path*/ ctx[2] === undefined && !('path' in props)) {
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

    /* src/components/Folder.svelte generated by Svelte v3.49.0 */
    const file$3 = "src/components/Folder.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (15:0) {#if expanded}
    function create_if_block(ctx) {
    	let ul;
    	let current;
    	let each_value = /*files*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
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

    			attr_dev(ul, "class", "svelte-vfff97");
    			add_location(ul, file$3, 15, 4, 270);
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
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
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
    		id: create_if_block.name,
    		type: "if",
    		source: "(15:0) {#if expanded}",
    		ctx
    	});

    	return block;
    }

    // (21:16) {:else}
    function create_else_block(ctx) {
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
    		id: create_else_block.name,
    		type: "else",
    		source: "(21:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (19:16) {#if file.children}
    function create_if_block_1(ctx) {
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
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(19:16) {#if file.children}",
    		ctx
    	});

    	return block;
    }

    // (17:8) {#each files as file}
    function create_each_block(ctx) {
    	let li;
    	let current_block_type_index;
    	let if_block;
    	let t;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*file*/ ctx[4].children) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			li = element("li");
    			if_block.c();
    			t = space();
    			attr_dev(li, "class", "svelte-vfff97");
    			add_location(li, file$3, 17, 12, 317);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			if_blocks[current_block_type_index].m(li, null);
    			append_dev(li, t);
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
    		id: create_each_block.name,
    		type: "each",
    		source: "(17:8) {#each files as file}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let t0;
    	let span;
    	let t1;
    	let t2;
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*expanded*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			t0 = space();
    			span = element("span");
    			t1 = text(/*name*/ ctx[1]);
    			t2 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(span, "class", "svelte-vfff97");
    			toggle_class(span, "expanded", /*expanded*/ ctx[0]);
    			add_location(span, file$3, 12, 0, 197);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, span, anchor);
    			append_dev(span, t1);
    			insert_dev(target, t2, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*toggle*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*name*/ 2) set_data_dev(t1, /*name*/ ctx[1]);

    			if (dirty & /*expanded*/ 1) {
    				toggle_class(span, "expanded", /*expanded*/ ctx[0]);
    			}

    			if (/*expanded*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*expanded*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
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
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span);
    			if (detaching) detach_dev(t2);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Folder', slots, []);
    	let { expanded = false } = $$props;
    	let { name } = $$props;
    	let { files } = $$props;

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
    		init$2(this, options, instance$4, create_fragment$4, safe_not_equal, { expanded: 0, name: 1, files: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Folder",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[1] === undefined && !('name' in props)) {
    			console.warn("<Folder> was created without expected prop 'name'");
    		}

    		if (/*files*/ ctx[2] === undefined && !('files' in props)) {
    			console.warn("<Folder> was created without expected prop 'files'");
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

    /* src/components/FileExplorer.svelte generated by Svelte v3.49.0 */

    function create_fragment$3(ctx) {
    	let t;
    	let folder;
    	let current;

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
    			t = space();
    			create_component(folder.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			mount_component(folder, target, anchor);
    			current = true;
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
    			if (detaching) detach_dev(t);
    			destroy_component(folder, detaching);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FileExplorer', slots, []);
    	let root = [];

    	fileState.subscribe(s => {
    		$$invalidate(0, root = s.files);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FileExplorer> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Folder, fileState, root });

    	$$self.$inject_state = $$props => {
    		if ('root' in $$props) $$invalidate(0, root = $$props.root);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [root];
    }

    class FileExplorer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$2(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FileExplorer",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/pages/editor.svelte generated by Svelte v3.49.0 */

    const { console: console_1 } = globals;

    const file$2 = "src/pages/editor.svelte";

    function create_fragment$2(ctx) {
    	let t0;
    	let div3;
    	let div0;
    	let fileexplorer;
    	let t1;
    	let div1;
    	let editor;
    	let t2;
    	let div2;
    	let current;
    	fileexplorer = new FileExplorer({ $$inline: true });

    	editor = new Editor({
    			props: { text: /*text*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			t0 = space();
    			div3 = element("div");
    			div0 = element("div");
    			create_component(fileexplorer.$$.fragment);
    			t1 = space();
    			div1 = element("div");
    			create_component(editor.$$.fragment);
    			t2 = space();
    			div2 = element("div");
    			div2.textContent = "Result";
    			attr_dev(div0, "class", "treeview svelte-rmn1h0");
    			add_location(div0, file$2, 26, 1, 506);
    			attr_dev(div1, "class", "editor svelte-rmn1h0");
    			add_location(div1, file$2, 29, 1, 557);
    			attr_dev(div2, "class", "result svelte-rmn1h0");
    			add_location(div2, file$2, 32, 1, 607);
    			attr_dev(div3, "class", "container svelte-rmn1h0");
    			add_location(div3, file$2, 25, 0, 481);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			mount_component(fileexplorer, div0, null);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			mount_component(editor, div1, null);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const editor_changes = {};
    			if (dirty & /*text*/ 1) editor_changes.text = /*text*/ ctx[0];
    			editor.$set(editor_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fileexplorer.$$.fragment, local);
    			transition_in(editor.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fileexplorer.$$.fragment, local);
    			transition_out(editor.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div3);
    			destroy_component(fileexplorer);
    			destroy_component(editor);
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
    	validate_slots('Editor', slots, []);
    	let { location } = $$props;

    	// the origin of the navigation, this way we can go back easilly.
    	let origin = location.origin;

    	// the code
    	let text = "";

    	fileState.subscribe(state => {
    		console.log(state);
    		$$invalidate(0, text = state.text);
    	});

    	const writable_props = ['location'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Editor> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('location' in $$props) $$invalidate(1, location = $$props.location);
    	};

    	$$self.$capture_state = () => ({
    		Editor,
    		FileExplorer,
    		fileState,
    		location,
    		origin,
    		text
    	});

    	$$self.$inject_state = $$props => {
    		if ('location' in $$props) $$invalidate(1, location = $$props.location);
    		if ('origin' in $$props) origin = $$props.origin;
    		if ('text' in $$props) $$invalidate(0, text = $$props.text);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [text, location];
    }

    class Editor_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$2(this, options, instance$2, create_fragment$2, safe_not_equal, { location: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Editor_1",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*location*/ ctx[1] === undefined && !('location' in props)) {
    			console_1.warn("<Editor> was created without expected prop 'location'");
    		}
    	}

    	get location() {
    		throw new Error("<Editor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set location(value) {
    		throw new Error("<Editor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/lexicon.svelte generated by Svelte v3.49.0 */

    const file$1 = "src/pages/lexicon.svelte";

    function create_fragment$1(ctx) {
    	let t0;
    	let div;

    	const block = {
    		c: function create() {
    			t0 = space();
    			div = element("div");
    			div.textContent = "Lexicon";
    			add_location(div, file$1, 0, 1, 1);
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
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Lexicon', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Lexicon> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Lexicon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$2(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Lexicon",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.49.0 */
    const file = "src/App.svelte";

    // (19:3) <Link to="/">
    function create_default_slot_5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Home");
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
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(19:3) <Link to=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (20:3) <Link to="about">
    function create_default_slot_4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("About");
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
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(20:3) <Link to=\\\"about\\\">",
    		ctx
    	});

    	return block;
    }

    // (21:3) <Link to="editor">
    function create_default_slot_3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Editor");
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
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(21:3) <Link to=\\\"editor\\\">",
    		ctx
    	});

    	return block;
    }

    // (22:3) <Link to="lexicon">
    function create_default_slot_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Lexicon");
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
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(22:3) <Link to=\\\"lexicon\\\">",
    		ctx
    	});

    	return block;
    }

    // (28:3) <Route path="/">
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
    		source: "(28:3) <Route path=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (17:1) <Router {url}>
    function create_default_slot(ctx) {
    	let nav;
    	let link0;
    	let t0;
    	let link1;
    	let t1;
    	let link2;
    	let t2;
    	let link3;
    	let t3;
    	let div;
    	let route0;
    	let t4;
    	let route1;
    	let t5;
    	let route2;
    	let t6;
    	let route3;
    	let current;

    	link0 = new Link({
    			props: {
    				to: "/",
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link1 = new Link({
    			props: {
    				to: "about",
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link2 = new Link({
    			props: {
    				to: "editor",
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link3 = new Link({
    			props: {
    				to: "lexicon",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
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
    			nav = element("nav");
    			create_component(link0.$$.fragment);
    			t0 = space();
    			create_component(link1.$$.fragment);
    			t1 = space();
    			create_component(link2.$$.fragment);
    			t2 = space();
    			create_component(link3.$$.fragment);
    			t3 = space();
    			div = element("div");
    			create_component(route0.$$.fragment);
    			t4 = space();
    			create_component(route1.$$.fragment);
    			t5 = space();
    			create_component(route2.$$.fragment);
    			t6 = space();
    			create_component(route3.$$.fragment);
    			add_location(nav, file, 17, 2, 308);
    			attr_dev(div, "class", "main-container");
    			add_location(div, file, 23, 2, 458);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			mount_component(link0, nav, null);
    			append_dev(nav, t0);
    			mount_component(link1, nav, null);
    			append_dev(nav, t1);
    			mount_component(link2, nav, null);
    			append_dev(nav, t2);
    			mount_component(link3, nav, null);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(route0, div, null);
    			append_dev(div, t4);
    			mount_component(route1, div, null);
    			append_dev(div, t5);
    			mount_component(route2, div, null);
    			append_dev(div, t6);
    			mount_component(route3, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const link0_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				link0_changes.$$scope = { dirty, ctx };
    			}

    			link0.$set(link0_changes);
    			const link1_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				link1_changes.$$scope = { dirty, ctx };
    			}

    			link1.$set(link1_changes);
    			const link2_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				link2_changes.$$scope = { dirty, ctx };
    			}

    			link2.$set(link2_changes);
    			const link3_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				link3_changes.$$scope = { dirty, ctx };
    			}

    			link3.$set(link3_changes);
    			const route3_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route3_changes.$$scope = { dirty, ctx };
    			}

    			route3.$set(route3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link0.$$.fragment, local);
    			transition_in(link1.$$.fragment, local);
    			transition_in(link2.$$.fragment, local);
    			transition_in(link3.$$.fragment, local);
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			transition_in(route2.$$.fragment, local);
    			transition_in(route3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link0.$$.fragment, local);
    			transition_out(link1.$$.fragment, local);
    			transition_out(link2.$$.fragment, local);
    			transition_out(link3.$$.fragment, local);
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(route2.$$.fragment, local);
    			transition_out(route3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			destroy_component(link0);
    			destroy_component(link1);
    			destroy_component(link2);
    			destroy_component(link3);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div);
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
    		source: "(17:1) <Router {url}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let router;
    	let current;

    	router = new Router({
    			props: {
    				url: /*url*/ ctx[0],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(router.$$.fragment);
    			add_location(main, file, 15, 0, 283);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(router, main, null);
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
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(router);
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
    		init$2(this, options, instance, create_fragment, safe_not_equal, { url: 0 });

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
            "editor.background": "#273241",
            "minimap.background": "#273241"
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
    init$1();

    const app = new App({
    	target: document.body,
    	props: {
    		
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
