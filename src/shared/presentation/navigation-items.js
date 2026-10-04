export const NAVIGATION_ITEMS = [
    { label: 'navigation.home', icon: 'pi pi-home', routeName: 'home', roles: [] },
    { label: 'navigation.analytics', icon: 'pi pi-chart-bar', routeName: 'analytics', roles: ['administrator', 'fleet_supervisor'] },
    { label: 'navigation.operations', icon: 'pi pi-list', routeName: 'operations', roles: ['fleet_supervisor'] },
    { label: 'navigation.monitoring', icon: 'pi pi-map-marker', routeName: 'monitoring', roles: ['fleet_supervisor'] },
    { label: 'navigation.incidents', icon: 'pi pi-exclamation-triangle', routeName: 'incidents', roles: ['fleet_supervisor'] },
    { label: 'navigation.history', icon: 'pi pi-history', routeName: 'history', roles: ['fleet_supervisor'] },
    { label: 'navigation.vehicles', icon: 'pi pi-truck', routeName: 'vehicles', roles: ['administrator', 'fleet_supervisor'] },
    { label: 'navigation.drivers', icon: 'pi pi-id-card', routeName: 'drivers', roles: ['administrator', 'fleet_supervisor'] },
    { label: 'navigation.devices', icon: 'pi pi-sliders-h', routeName: 'devices', roles: ['administrator'] },
    { label: 'navigation.users', icon: 'pi pi-users', routeName: 'users', roles: ['administrator'] },
    { label: 'navigation.company', icon: 'pi pi-building', routeName: 'company', roles: ['administrator'] },
    { label: 'navigation.tracking', icon: 'pi pi-box', routeName: 'tracking', roles: ['delivery_point_owner'] }
];
