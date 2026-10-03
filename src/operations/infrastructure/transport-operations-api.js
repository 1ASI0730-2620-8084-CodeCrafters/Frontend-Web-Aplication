import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

const transportOperationsEndpointPath = import.meta.env.VITE_TRANSPORT_OPERATIONS_ENDPOINT_PATH;
const deliveryStopsEndpointPath = import.meta.env.VITE_DELIVERY_STOPS_ENDPOINT_PATH;
const deliveryPointsEndpointPath = import.meta.env.VITE_DELIVERY_POINTS_ENDPOINT_PATH;
const vehiclesEndpointPath = import.meta.env.VITE_VEHICLES_ENDPOINT_PATH;
const driversEndpointPath = import.meta.env.VITE_DRIVERS_ENDPOINT_PATH;

export class TransportOperationsApi extends BaseApi {
    #operationsEndpoint;
    #stopsEndpoint;
    #deliveryPointsEndpoint;
    #vehiclesEndpoint;
    #driversEndpoint;

    constructor() {
        super();
        this.#operationsEndpoint = new BaseEndpoint(this, transportOperationsEndpointPath);
        this.#stopsEndpoint = new BaseEndpoint(this, deliveryStopsEndpointPath);
        this.#deliveryPointsEndpoint = new BaseEndpoint(this, deliveryPointsEndpointPath);
        this.#vehiclesEndpoint = new BaseEndpoint(this, vehiclesEndpointPath);
        this.#driversEndpoint = new BaseEndpoint(this, driversEndpointPath);
    }

    getOperations(organizationId) {
        return this.#operationsEndpoint.getAll({ organizationId });
    }

    getOperationById(operationId) {
        return this.#operationsEndpoint.getById(operationId);
    }

    createOperation(operationResource) {
        return this.#operationsEndpoint.create(operationResource);
    }

    updateOperation(operationId, changes) {
        return this.#operationsEndpoint.partialUpdate(operationId, changes);
    }

    getStopsByOperations(operationIds) {
        return this.#stopsEndpoint.getAll({ transportOperationId: operationIds });
    }

    createStop(stopResource) {
        return this.#stopsEndpoint.create(stopResource);
    }

    updateStop(stopId, changes) {
        return this.#stopsEndpoint.partialUpdate(stopId, changes);
    }

    getDeliveryPoints(organizationId) {
        return this.#deliveryPointsEndpoint.getAll({ organizationId });
    }

    getVehicles(organizationId) {
        return this.#vehiclesEndpoint.getAll({ organizationId });
    }

    getVehicleById(vehicleId) {
        return this.#vehiclesEndpoint.getById(vehicleId);
    }

    setVehicleStatus(vehicleId, status) {
        return this.#vehiclesEndpoint.partialUpdate(vehicleId, { status });
    }

    getDrivers(organizationId) {
        return this.#driversEndpoint.getAll({ organizationId });
    }

    getDriverById(driverId) {
        return this.#driversEndpoint.getById(driverId);
    }

    setDriverStatus(driverId, status) {
        return this.#driversEndpoint.partialUpdate(driverId, { status });
    }
}
