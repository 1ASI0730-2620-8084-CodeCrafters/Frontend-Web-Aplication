const DELIVERY_POINT_SOURCE = 'delivery_point';
const DEFAULT_SEVERITY = 'medium';
const REPORTED_STATUS = 'reported';

export class IncidentAssembler {
    static nextCode(latestIncident) {
        const lastNumber = Number(latestIncident?.code.replace(/\D/g, '')) || 0;
        return `INC-${String(lastNumber + 1).padStart(4, '0')}`;
    }

    static toResourceFromCommand(command, code) {
        return {
            id: crypto.randomUUID(),
            code,
            transportOperationId: command.deliveryOrder.transportOperationId,
            deliveryStopId: command.deliveryOrder.id,
            reportedBy: command.reportedBy,
            source: DELIVERY_POINT_SOURCE,
            type: command.type,
            severity: DEFAULT_SEVERITY,
            description: command.description,
            affectedQuantity: command.affectedQuantity,
            status: REPORTED_STATUS,
            resolution: null,
            reportedAt: new Date().toISOString(),
            resolvedAt: null
        };
    }
}
