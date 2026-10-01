const vehicleList = () => import('./views/vehicle-list.vue');
const driverList = () => import('./views/driver-list.vue');

const FLEET_ROLES = ['administrator', 'fleet_supervisor'];

const fleetRoutes = [
    { path: 'vehicles', name: 'vehicles', component: vehicleList, meta: { title: 'fleet.vehicles.title', roles: FLEET_ROLES } },
    { path: 'drivers', name: 'drivers', component: driverList, meta: { title: 'fleet.drivers.title', roles: FLEET_ROLES } }
];

export default fleetRoutes;
