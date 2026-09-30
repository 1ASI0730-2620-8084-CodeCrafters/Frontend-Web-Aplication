import { DeliveryOrder } from '../domain/model/delivery-order.entity.js';
import { DELIVERY_STATUSES } from '../domain/model/delivery-status.js';

export class DeliveryOrderAssembler {
    static toEntityFromResources({ stop, operation, deliveryPoint, operationStops, incidents }) {
        const pendingStopsBefore = operationStops.filter(operationStop =>
            operationStop.transportOperationId === stop.transportOperationId
            && operationStop.sequenceNumber < stop.sequenceNumber
            && operationStop.status === DELIVERY_STATUSES.PENDING).length;
        return new DeliveryOrder({
            id: stop.id,
            transportOperationId: stop.transportOperationId,
            operationCode: operation.code,
            operationStatus: operation.status,
            scheduledDate: operation.scheduledDate,
            deliveryPointName: deliveryPoint.businessName,
            sequenceNumber: stop.sequenceNumber,
            plannedQuantity: stop.plannedQuantity,
            deliveredQuantity: stop.deliveredQuantity,
            status: stop.status,
            failureReason: stop.failureReason,
            confirmedAt: stop.confirmedAt,
            pendingStopsBefore,
            hasReportedProblem: incidents.some(incident => incident.deliveryStopId === stop.id)
        });
    }

    static toEntitiesFromResources({ stops, operations, deliveryPoints, operationStops, incidents }) {
        return stops
            .map(stop => ({
                stop,
                operation: operations.find(operation => operation.id === stop.transportOperationId),
                deliveryPoint: deliveryPoints.find(deliveryPoint => deliveryPoint.id === stop.deliveryPointId)
            }))
            .filter(({ operation, deliveryPoint }) => operation && deliveryPoint)
            .map(({ stop, operation, deliveryPoint }) => this.toEntityFromResources({ stop, operation, deliveryPoint, operationStops, incidents }))
            .sort((first, second) => second.scheduledDate.localeCompare(first.scheduledDate));
    }
}
