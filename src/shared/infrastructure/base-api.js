import axios from 'axios';
import { snapshotAdapter } from './snapshot.adapter.js';

const platformApiUrl = import.meta.env.VITE_API_BASE_URL;
const usesSnapshot = Boolean(import.meta.env.VITE_API_SNAPSHOT_PATH);
const requestInterceptors = [];

export function registerRequestInterceptor(interceptor) {
    requestInterceptors.push(interceptor);
}

export class BaseApi {
    #http;

    constructor() {
        this.#http = axios.create({
            baseURL: platformApiUrl,
            headers: { 'Content-Type': 'application/json' },
            paramsSerializer: { indexes: null },
            ...(usesSnapshot && { adapter: snapshotAdapter })
        });
        this.#http.interceptors.request.use(config => requestInterceptors.reduce((current, interceptor) => interceptor(current), config));
    }

    get http() {
        return this.#http;
    }
}
