import useIamStore from '../application/iam.store.js';

export const authenticationGuard = to => {
    const store = useIamStore();
    if (to.meta.public) {
        return to.name === 'iam-sign-in' && store.isSignedIn ? { name: 'home' } : true;
    }
    if (!store.isSignedIn) {
        return { name: 'iam-sign-in', query: { redirect: to.fullPath } };
    }
    return store.canAccess(to.meta.roles) ? true : { name: 'home' };
};
