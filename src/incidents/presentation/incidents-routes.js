const incidentList = () => import('./views/incident-list.vue');
const analyticsDashboard = () => import('./views/analytics-dashboard.vue');

const incidentsRoutes = [
    { path: '/incidents', name: 'incidents', component: incidentList, meta: { title: 'incidents.list.title', roles: ['fleet_supervisor'] } },
    { path: '/analytics', name: 'analytics', component: analyticsDashboard, meta: { title: 'incidents.dashboard.title', roles: ['administrator', 'fleet_supervisor'] } }
];

export default incidentsRoutes;
