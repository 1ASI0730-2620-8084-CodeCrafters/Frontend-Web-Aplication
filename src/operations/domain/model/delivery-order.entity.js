import { DELIVERY_STATUSES, OPERATION_STATUSES } from './delivery-status.js';

const OPERATION_STATUSES_ON_ROUTE = [OPERATION_STATUSES.DISPATCHED, OPERATION_STATUSES.IN_PROGRESS];

export class DeliveryOrder {
    constructor({
        id,
        transportOperationId,
        operationCode,
        operationStatus,
        scheduledDate,
        deliveryPointName,
        sequenceNumber,
        plannedQuantity,
        deliveredQuantity = null,
        status,
        failureReason = null,
        confirmedAt = null,
        pendingStopsBefore = 0,
        hasReportedProblem = false
    }) {
        this.id = id;
        this.transportOperationId = transportOperationId;
        this.operationCode = operationCode;
        this.operationStatus = operationStatus;
        this.scheduledDate = scheduledDate;
        this.deliveryPointName = deliveryPointName;
        this.sequenceNumber = sequenceNumber;
        this.plannedQuantity = plannedQuantity;
        this.deliveredQuantity = deliveredQuantity;
        this.status = status;
        this.failureReason = failureReason;
        this.confirmedAt = confirmedAt;
        this.pendingStopsBefore = pendingStopsBefore;
        this.hasReportedProblem = hasReportedProblem;
    }

    get isRegistered() {
        return this.status !== DELIVERY_STATUSES.PENDING;
    }

    get isOnRoute() {
        return !this.isRegistered && OPERATION_STATUSES_ON_ROUTE.includes(this.operationStatus);
    }

    get trackingStatus() {
        if (this.isRegistered) return this.status;
        return this.isOnRoute ? 'on_route' : 'scheduled';
    }

    get shortage() {
        return this.isRegistered ? Math.max(this.plannedQuantity - (this.deliveredQuantity ?? 0), 0) : 0;
    }

    get canReportProblem() {
        return this.isRegistered && !this.hasReportedProblem;
    }
}
