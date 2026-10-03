const monitoringDashboard = () => import('./views/monitoring-dashboard.vue');
const deviceSettings = () => import('./views/device-settings.vue');

const monitoringRoutes = [
    { path: '', name: 'monitoring', component: monitoringDashboard, meta: { title: 'monitoring.title', roles: ['fleet_supervisor'] } },
    { path: 'devices', name: 'devices', component: deviceSettings, meta: { title: 'monitoring.devices.title', roles: ['administrator'] } }
];

export default monitoringRoutes;
