import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

const vehiclesEndpointPath = import.meta.env.VITE_VEHICLES_ENDPOINT_PATH;
const driversEndpointPath = import.meta.env.VITE_DRIVERS_ENDPOINT_PATH;

export class FleetApi extends BaseApi {
    #vehiclesEndpoint;
    #driversEndpoint;

    constructor() {
        super();
        this.#vehiclesEndpoint = new BaseEndpoint(this, vehiclesEndpointPath);
        this.#driversEndpoint = new BaseEndpoint(this, driversEndpointPath);
    }

    getVehicles(organizationId) {
        return this.#vehiclesEndpoint.getAll({ organizationId });
    }

    getVehiclesByPlateNumber(plateNumber) {
        return this.#vehiclesEndpoint.getAll({ plateNumber });
    }

    createVehicle(vehicleResource) {
        return this.#vehiclesEndpoint.create(vehicleResource);
    }

    updateVehicle(vehicleId, vehicleResource) {
        return this.#vehiclesEndpoint.partialUpdate(vehicleId, vehicleResource);
    }

    getDrivers(organizationId) {
        return this.#driversEndpoint.getAll({ organizationId });
    }

    getDriversByField(field, value) {
        return this.#driversEndpoint.getAll({ [field]: value });
    }

    createDriver(driverResource) {
        return this.#driversEndpoint.create(driverResource);
    }

    updateDriver(driverId, driverResource) {
        return this.#driversEndpoint.partialUpdate(driverId, driverResource);
    }
}
