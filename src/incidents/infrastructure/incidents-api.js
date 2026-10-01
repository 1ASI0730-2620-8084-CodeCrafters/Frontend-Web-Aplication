import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

const incidentsEndpointPath = import.meta.env.VITE_INCIDENTS_ENDPOINT_PATH;
const transportOperationsEndpointPath = import.meta.env.VITE_TRANSPORT_OPERATIONS_ENDPOINT_PATH;
const deliveryStopsEndpointPath = import.meta.env.VITE_DELIVERY_STOPS_ENDPOINT_PATH;
const evidencesEndpointPath = import.meta.env.VITE_EVIDENCES_ENDPOINT_PATH;

export class IncidentsApi extends BaseApi {
    #incidentsEndpoint;
    #operationsEndpoint;
    #stopsEndpoint;
    #evidencesEndpoint;

    constructor() {
        super();
        this.#incidentsEndpoint = new BaseEndpoint(this, incidentsEndpointPath);
        this.#operationsEndpoint = new BaseEndpoint(this, transportOperationsEndpointPath);
        this.#stopsEndpoint = new BaseEndpoint(this, deliveryStopsEndpointPath);
        this.#evidencesEndpoint = new BaseEndpoint(this, evidencesEndpointPath);
    }

    getOperations(organizationId) {
        return this.#operationsEndpoint.getAll({ organizationId });
    }

    getStopsByOperations(operationIds) {
        return this.#stopsEndpoint.getAll({ transportOperationId: operationIds });
    }

    getIncidentsByOperations(operationIds) {
        return this.#incidentsEndpoint.getAll({ transportOperationId: operationIds, _sort: 'reportedAt', _order: 'desc' });
    }

    createIncident(incidentResource) {
        return this.#incidentsEndpoint.create(incidentResource);
    }

    updateIncident(incidentId, changes) {
        return this.#incidentsEndpoint.partialUpdate(incidentId, changes);
    }

    getEvidencesByIncident(incidentId) {
        return this.#evidencesEndpoint.getAll({ incidentId });
    }

    createEvidence(evidenceResource) {
        return this.#evidencesEndpoint.create(evidenceResource);
    }
}
