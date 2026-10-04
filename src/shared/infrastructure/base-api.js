import axios from 'axios';

const platformApiUrl = import.meta.env.VITE_API_BASE_URL;
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
            paramsSerializer: { indexes: null }
        });
        this.#http.interceptors.request.use(config => requestInterceptors.reduce((current, interceptor) => interceptor(current), config));
    }

    get http() {
        return this.#http;
    }
}
