import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

const transportOperationsEndpointPath = import.meta.env.VITE_TRANSPORT_OPERATIONS_ENDPOINT_PATH;
const vehiclesEndpointPath = import.meta.env.VITE_VEHICLES_ENDPOINT_PATH;
const iotDevicesEndpointPath = import.meta.env.VITE_IOT_DEVICES_ENDPOINT_PATH;
const sensorReadingsEndpointPath = import.meta.env.VITE_SENSOR_READINGS_ENDPOINT_PATH;
const alertsEndpointPath = import.meta.env.VITE_ALERTS_ENDPOINT_PATH;
const incidentsEndpointPath = import.meta.env.VITE_INCIDENTS_ENDPOINT_PATH;

export class MonitoringApi extends BaseApi {
    #operationsEndpoint;
    #vehiclesEndpoint;
    #devicesEndpoint;
    #readingsEndpoint;
    #alertsEndpoint;
    #incidentsEndpoint;

    constructor() {
        super();
        this.#operationsEndpoint = new BaseEndpoint(this, transportOperationsEndpointPath);
        this.#vehiclesEndpoint = new BaseEndpoint(this, vehiclesEndpointPath);
        this.#devicesEndpoint = new BaseEndpoint(this, iotDevicesEndpointPath);
        this.#readingsEndpoint = new BaseEndpoint(this, sensorReadingsEndpointPath);
        this.#alertsEndpoint = new BaseEndpoint(this, alertsEndpointPath);
        this.#incidentsEndpoint = new BaseEndpoint(this, incidentsEndpointPath);
    }

    getOperations(organizationId, status) {
        return this.#operationsEndpoint.getAll({ organizationId, status });
    }

    getVehicles(organizationId) {
        return this.#vehiclesEndpoint.getAll({ organizationId });
    }

    getDevicesByVehicles(vehicleIds) {
        return this.#devicesEndpoint.getAll({ vehicleId: vehicleIds });
    }

    getLatestReading(transportOperationId) {
        return this.#readingsEndpoint.getAll({ transportOperationId, _sort: 'recordedAt', _order: 'desc', _limit: 1 });
    }

    updateDevice(deviceId, changes) {
        return this.#devicesEndpoint.partialUpdate(deviceId, changes);
    }

    getLatestIncident() {
        return this.#incidentsEndpoint.getAll({ _sort: 'code', _order: 'desc', _limit: 1 });
    }

    createIncident(incidentResource) {
        return this.#incidentsEndpoint.create(incidentResource);
    }

    createReading(readingResource) {
        return this.#readingsEndpoint.create(readingResource);
    }

    getAlertsByOperations(transportOperationIds) {
        return this.#alertsEndpoint.getAll({ transportOperationId: transportOperationIds, _sort: 'raisedAt', _order: 'desc' });
    }

    createAlert(alertResource) {
        return this.#alertsEndpoint.create(alertResource);
    }

    acknowledgeAlert(alertId, changes) {
        return this.#alertsEndpoint.partialUpdate(alertId, changes);
    }
}
