import { defineStore } from 'pinia';
import { ref } from 'vue';
import { FleetApi } from '../infrastructure/fleet-api.js';
import { DriverAssembler, VehicleAssembler } from '../infrastructure/fleet.assemblers.js';

const fleetApi = new FleetApi();

const useFleetStore = defineStore('fleet', () => {
    const vehicles = ref([]);
    const drivers = ref([]);
    const vehiclesLoaded = ref(false);
    const driversLoaded = ref(false);
    const isSaving = ref(false);

    async function runSaving(operation) {
        isSaving.value = true;
        try {
            return await operation();
        } catch {
            return 'request-failed';
        } finally {
            isSaving.value = false;
        }
    }

    function replaceById(collection, entity) {
        return collection.map(item => (item.id === entity.id ? entity : item));
    }

    async function fetchVehicles(organizationId) {
        const response = await fleetApi.getVehicles(organizationId);
        vehicles.value = VehicleAssembler.toEntitiesFromResponse(response);
        vehiclesLoaded.value = true;
    }

    async function isPlateNumberTaken(vehicle) {
        const response = await fleetApi.getVehiclesByPlateNumber(vehicle.plateNumber.trim().toUpperCase());
        return response.data.some(resource => resource.id !== vehicle.id);
    }

    function saveVehicle(vehicle) {
        return runSaving(async () => {
            if (await isPlateNumberTaken(vehicle)) return 'plate-number-taken';
            const resource = VehicleAssembler.toResourceFromEntity(vehicle);
            if (vehicle.id) {
                const response = await fleetApi.updateVehicle(vehicle.id, resource);
                vehicles.value = replaceById(vehicles.value, VehicleAssembler.toEntityFromResource(response.data));
            } else {
                const response = await fleetApi.createVehicle({ id: crypto.randomUUID(), ...resource });
                vehicles.value = [...vehicles.value, VehicleAssembler.toEntityFromResource(response.data)];
            }
            return null;
        });
    }

    async function fetchDrivers(organizationId) {
        const response = await fleetApi.getDrivers(organizationId);
        drivers.value = DriverAssembler.toEntitiesFromResponse(response);
        driversLoaded.value = true;
    }

    async function findDuplicatedDriverField(driver) {
        const resource = DriverAssembler.toResourceFromEntity(driver);
        for (const field of ['documentNumber', 'licenseNumber']) {
            const response = await fleetApi.getDriversByField(field, resource[field]);
            if (response.data.some(existing => existing.id !== driver.id)) return `${field}-taken`;
        }
        return null;
    }

    function saveDriver(driver) {
        return runSaving(async () => {
            const duplicatedField = await findDuplicatedDriverField(driver);
            if (duplicatedField) return duplicatedField;
            const resource = DriverAssembler.toResourceFromEntity(driver);
            if (driver.id) {
                const response = await fleetApi.updateDriver(driver.id, resource);
                drivers.value = replaceById(drivers.value, DriverAssembler.toEntityFromResource(response.data));
            } else {
                const response = await fleetApi.createDriver({ id: crypto.randomUUID(), ...resource });
                drivers.value = [...drivers.value, DriverAssembler.toEntityFromResource(response.data)];
            }
            return null;
        });
    }

    return {
        vehicles,
        drivers,
        vehiclesLoaded,
        driversLoaded,
        isSaving,
        fetchVehicles,
        saveVehicle,
        fetchDrivers,
        saveDriver
    };
});

export default useFleetStore;
