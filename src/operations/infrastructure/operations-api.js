import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

const deliveryPointsEndpointPath = import.meta.env.VITE_DELIVERY_POINTS_ENDPOINT_PATH;
const transportOperationsEndpointPath = import.meta.env.VITE_TRANSPORT_OPERATIONS_ENDPOINT_PATH;
const deliveryStopsEndpointPath = import.meta.env.VITE_DELIVERY_STOPS_ENDPOINT_PATH;
const incidentsEndpointPath = import.meta.env.VITE_INCIDENTS_ENDPOINT_PATH;

export class OperationsApi extends BaseApi {
    #deliveryPointsEndpoint;
    #transportOperationsEndpoint;
    #deliveryStopsEndpoint;
    #incidentsEndpoint;

    constructor() {
        super();
        this.#deliveryPointsEndpoint = new BaseEndpoint(this, deliveryPointsEndpointPath);
        this.#transportOperationsEndpoint = new BaseEndpoint(this, transportOperationsEndpointPath);
        this.#deliveryStopsEndpoint = new BaseEndpoint(this, deliveryStopsEndpointPath);
        this.#incidentsEndpoint = new BaseEndpoint(this, incidentsEndpointPath);
    }

    getDeliveryPointsByOwner(ownerUserId) {
        return this.#deliveryPointsEndpoint.getAll({ ownerUserId });
    }

    getDeliveryStopsByDeliveryPoints(deliveryPointIds) {
        return this.#deliveryStopsEndpoint.getAll({ deliveryPointId: deliveryPointIds });
    }

    getDeliveryStopsByOperations(transportOperationIds) {
        return this.#deliveryStopsEndpoint.getAll({ transportOperationId: transportOperationIds });
    }

    getTransportOperationsByIds(transportOperationIds) {
        return this.#transportOperationsEndpoint.getAll({ id: transportOperationIds });
    }

    getIncidentsByDeliveryStops(deliveryStopIds) {
        return this.#incidentsEndpoint.getAll({ deliveryStopId: deliveryStopIds });
    }

    getLatestIncident() {
        return this.#incidentsEndpoint.getAll({ _sort: 'code', _order: 'desc', _limit: 1 });
    }

    createIncident(incidentResource) {
        return this.#incidentsEndpoint.create(incidentResource);
    }
}
