import { createRouter, createWebHistory } from 'vue-router';
import i18n from './i18n.js';
import iamRoutes from './iam/presentation/iam-routes.js';
import monitoringRoutes from './monitoring/presentation/monitoring-routes.js';
import { authenticationGuard } from './iam/infrastructure/authentication.guard.js';

const home = () => import('./shared/presentation/views/home.vue');
const pageNotFound = () => import('./shared/presentation/views/page-not-found.vue');

const routes = [
    { path: '/', redirect: { name: 'home' } },
    { path: '/home', name: 'home', component: home, meta: { title: 'navigation.home' } },
    { path: '/iam', children: iamRoutes },
    { path: '/monitoring', children: monitoringRoutes },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: pageNotFound, meta: { title: 'not-found.title' } }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

router.beforeEach(authenticationGuard);

router.afterEach(to => {
    const pageTitle = to.meta.title ? i18n.global.t(to.meta.title) : null;
    document.title = pageTitle ? `${pageTitle} | BottleTrack` : 'BottleTrack';
});

export default router;
