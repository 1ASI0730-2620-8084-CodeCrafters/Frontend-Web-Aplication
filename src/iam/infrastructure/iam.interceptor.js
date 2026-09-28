import useIamStore from '../application/iam.store.js';

export const iamInterceptor = config => {
    const { currentToken } = useIamStore();
    if (currentToken) config.headers.Authorization = `Bearer ${currentToken}`;
    return config;
};
