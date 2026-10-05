import axios, { AxiosError } from 'axios';

const STORAGE_KEY = 'bottletrack-snapshot';
const CONTROL_PARAMS = ['_sort', '_order', '_limit'];

let snapshotPromise = null;

function readStoredSnapshot() {
    try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
}

function storeSnapshot(snapshot) {
    try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
        return;
    }
}

function loadSnapshot(config) {
    if (!snapshotPromise) {
        const stored = readStoredSnapshot();
        snapshotPromise = stored
            ? Promise.resolve(stored)
            : axios.get(`${config.baseURL}${import.meta.env.VITE_API_SNAPSHOT_PATH}`).then(({ data }) => {
                storeSnapshot(data);
                return data;
            });
    }
    return snapshotPromise;
}

function matches(item, key, expected) {
    const values = Array.isArray(expected) ? expected : [expected];
    return values.some(value => String(item[key]) === String(value));
}

function query(collection, params = {}) {
    let result = collection.filter(item => Object.entries(params)
        .filter(([key, value]) => !CONTROL_PARAMS.includes(key) && value !== undefined)
        .every(([key, value]) => matches(item, key, value)));
    if (params._sort) {
        const direction = params._order === 'desc' ? -1 : 1;
        result = [...result].sort((a, b) => (a[params._sort] > b[params._sort] ? 1 : a[params._sort] < b[params._sort] ? -1 : 0) * direction);
    }
    if (params._limit) result = result.slice(0, Number(params._limit));
    return result;
}

function respond(config, status, data) {
    const response = { data, status, statusText: String(status), headers: {}, config, request: null };
    if (status >= 400) throw new AxiosError(`Request failed with status code ${status}`, AxiosError.ERR_BAD_REQUEST, config, null, response);
    return response;
}

export async function snapshotAdapter(config) {
    const snapshot = await loadSnapshot(config);
    const [resourceName, id] = config.url.split('?')[0].replace(/^\/+/, '').split('/');
    const collection = snapshot[resourceName];
    if (!collection) return respond(config, 404, {});
    const method = config.method.toLowerCase();
    const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data ?? {};
    const index = id ? collection.findIndex(item => String(item.id) === id) : -1;

    if (method === 'get') {
        if (!id) return respond(config, 200, query(collection, config.params));
        return index >= 0 ? respond(config, 200, collection[index]) : respond(config, 404, {});
    }
    if (method === 'post') {
        const created = { ...body, id: body.id ?? crypto.randomUUID() };
        collection.push(created);
        storeSnapshot(snapshot);
        return respond(config, 201, created);
    }
    if (index < 0) return respond(config, 404, {});
    if (method === 'delete') {
        collection.splice(index, 1);
        storeSnapshot(snapshot);
        return respond(config, 200, {});
    }
    collection[index] = method === 'put' ? { ...body, id: collection[index].id } : { ...collection[index], ...body };
    storeSnapshot(snapshot);
    return respond(config, 200, collection[index]);
}
