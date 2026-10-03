const deliveryOrderTracking = () => import('./views/delivery-order-tracking.vue');
const operationList = () => import('./views/operation-list.vue');
const operationDetail = () => import('./views/operation-detail.vue');
const operationHistory = () => import('./views/operation-history.vue');

const SUPERVISOR_ROLES = ['fleet_supervisor'];

const operationsRoutes = [
    {
        path: '/operations',
        children: [
            { path: '', name: 'operations', component: operationList, meta: { title: 'operations.list.title', roles: SUPERVISOR_ROLES } },
            { path: 'history', name: 'history', component: operationHistory, meta: { title: 'operations.history.title', roles: SUPERVISOR_ROLES } },
            { path: ':id', name: 'operation-detail', component: operationDetail, meta: { title: 'operations.detail.title', roles: SUPERVISOR_ROLES } }
        ]
    },
    {
        path: '/tracking',
        name: 'tracking',
        component: deliveryOrderTracking,
        meta: { title: 'operations.tracking.title', roles: ['delivery_point_owner'] }
    }
];

export default operationsRoutes;
