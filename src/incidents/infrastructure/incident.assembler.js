import { Incident, INCIDENT_STATUSES } from '../domain/model/incident.entity.js';
import { Evidence } from '../domain/model/evidence.entity.js';

export class IncidentAssembler {
    static toEntityFromResource(resource, operations) {
        const operation = operations.find(item => item.id === resource.transportOperationId);
        return new Incident({ ...resource, operationCode: operation?.code ?? '' });
    }

    static toEntitiesFromResources(resources, operations) {
        return resources.map(resource => this.toEntityFromResource(resource, operations));
    }

    static nextCode(incidents) {
        const highest = incidents.reduce((current, incident) => Math.max(current, Number(incident.code.replace(/\D/g, '')) || 0), 0);
        return `INC-${String(highest + 1).padStart(4, '0')}`;
    }

    static toResourceFromReportCommand(command, code) {
        return {
            id: crypto.randomUUID(),
            code,
            transportOperationId: command.transportOperationId,
            deliveryStopId: null,
            reportedBy: command.reportedBy,
            source: 'fleet_supervisor',
            type: command.type,
            severity: command.severity,
            description: command.description,
            affectedQuantity: command.affectedQuantity,
            status: INCIDENT_STATUSES.REPORTED,
            resolution: null,
            reportedAt: new Date().toISOString(),
            resolvedAt: null
        };
    }

    static toChangesFromAdvanceCommand(command) {
        if (command.nextStatus !== INCIDENT_STATUSES.RESOLVED) return { status: command.nextStatus };
        return { status: command.nextStatus, resolution: command.resolution, resolvedAt: new Date().toISOString() };
    }
}

export class EvidenceAssembler {
    static toEntityFromResource(resource) {
        return new Evidence(resource);
    }

    static toEntitiesFromResources(resources) {
        return resources.map(resource => this.toEntityFromResource(resource));
    }

    static toResourceFromCommand(command) {
        return {
            id: crypto.randomUUID(),
            incidentId: command.incidentId,
            fileUrl: command.fileUrl,
            fileType: 'image',
            uploadedAt: new Date().toISOString(),
            uploadedBy: command.uploadedBy
        };
    }
}
