export const INCIDENT_TYPES = Object.freeze(['broken_bottles', 'damaged_product', 'shortage', 'delay']);
export const INCIDENT_SEVERITIES = Object.freeze(['low', 'medium', 'high', 'critical']);

export const INCIDENT_STATUSES = Object.freeze({
    REPORTED: 'reported',
    UNDER_REVIEW: 'under_review',
    RESOLVED: 'resolved',
    CLOSED: 'closed'
});

const NEXT_STATUS = {
    [INCIDENT_STATUSES.REPORTED]: INCIDENT_STATUSES.UNDER_REVIEW,
    [INCIDENT_STATUSES.UNDER_REVIEW]: INCIDENT_STATUSES.RESOLVED,
    [INCIDENT_STATUSES.RESOLVED]: INCIDENT_STATUSES.CLOSED
};

export class Incident {
    constructor({ id = null, code = '', transportOperationId = null, deliveryStopId = null, reportedBy = null, source = 'fleet_supervisor', type = '', severity = 'medium', description = '', affectedQuantity = 0, status = INCIDENT_STATUSES.REPORTED, resolution = null, reportedAt = '', resolvedAt = null, operationCode = '' }) {
        this.id = id;
        this.code = code;
        this.transportOperationId = transportOperationId;
        this.deliveryStopId = deliveryStopId;
        this.reportedBy = reportedBy;
        this.source = source;
        this.type = type;
        this.severity = severity;
        this.description = description;
        this.affectedQuantity = affectedQuantity;
        this.status = status;
        this.resolution = resolution;
        this.reportedAt = reportedAt;
        this.resolvedAt = resolvedAt;
        this.operationCode = operationCode;
    }

    get nextStatus() {
        return NEXT_STATUS[this.status] ?? null;
    }

    get isOpen() {
        return this.status === INCIDENT_STATUSES.REPORTED || this.status === INCIDENT_STATUSES.UNDER_REVIEW;
    }

    get requiresResolution() {
        return this.nextStatus === INCIDENT_STATUSES.RESOLVED;
    }
}

export class ReportIncidentCommand {
    constructor({ transportOperationId, reportedBy, type, severity, description, affectedQuantity }) {
        this.transportOperationId = transportOperationId;
        this.reportedBy = reportedBy;
        this.type = type;
        this.severity = severity;
        this.description = description.trim();
        this.affectedQuantity = affectedQuantity ?? 0;
    }

    get isValid() {
        return Boolean(this.transportOperationId && INCIDENT_TYPES.includes(this.type) && INCIDENT_SEVERITIES.includes(this.severity) && this.description);
    }
}

export class AdvanceIncidentCommand {
    constructor({ incident, resolution = '' }) {
        this.incident = incident;
        this.nextStatus = incident.nextStatus;
        this.resolution = resolution.trim();
    }

    get isValid() {
        return this.nextStatus !== null && (!this.incident.requiresResolution || this.resolution.length > 0);
    }
}
