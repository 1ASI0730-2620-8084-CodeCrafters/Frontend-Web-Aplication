import { DELIVERY_STATUSES, OPERATION_STATUSES } from './delivery-status.js';

export class DeliveryStop {
    constructor({ id = null, transportOperationId = null, deliveryPointId = null, deliveryPointName = '', deliveryPointAddress = '', deliveryPointDistrict = '', latitude = null, longitude = null, sequenceNumber = 1, plannedQuantity = 0, deliveredQuantity = null, status = DELIVERY_STATUSES.PENDING, failureReason = null, confirmedAt = null }) {
        this.id = id;
        this.transportOperationId = transportOperationId;
        this.deliveryPointId = deliveryPointId;
        this.deliveryPointName = deliveryPointName;
        this.deliveryPointAddress = deliveryPointAddress;
        this.deliveryPointDistrict = deliveryPointDistrict;
        this.latitude = latitude;
        this.longitude = longitude;
        this.sequenceNumber = sequenceNumber;
        this.plannedQuantity = plannedQuantity;
        this.deliveredQuantity = deliveredQuantity;
        this.status = status;
        this.failureReason = failureReason;
        this.confirmedAt = confirmedAt;
    }

    get isPending() {
        return this.status === DELIVERY_STATUSES.PENDING;
    }

    get hasLocation() {
        return this.latitude !== null && this.longitude !== null;
    }
}

export class TransportOperation {
    constructor({ id = null, organizationId = null, code = '', description = '', scheduledDate = '', vehicleId = null, driverId = null, status = OPERATION_STATUSES.PENDING, dispatchedAt = null, completedAt = null, cancellationReason = null, stops = [], vehiclePlateNumber = '', vehicleLabel = '', driverName = '' }) {
        this.id = id;
        this.organizationId = organizationId;
        this.code = code;
        this.description = description;
        this.scheduledDate = scheduledDate;
        this.vehicleId = vehicleId;
        this.driverId = driverId;
        this.status = status;
        this.dispatchedAt = dispatchedAt;
        this.completedAt = completedAt;
        this.cancellationReason = cancellationReason;
        this.stops = [...stops].sort((first, second) => first.sequenceNumber - second.sequenceNumber);
        this.vehiclePlateNumber = vehiclePlateNumber;
        this.vehicleLabel = vehicleLabel;
        this.driverName = driverName;
    }

    get isPending() {
        return this.status === OPERATION_STATUSES.PENDING;
    }

    get isInProgress() {
        return this.status === OPERATION_STATUSES.IN_PROGRESS;
    }

    get hasResources() {
        return Boolean(this.vehicleId && this.driverId);
    }

    get canCancel() {
        return this.isPending;
    }

    get isFinished() {
        return this.status === OPERATION_STATUSES.COMPLETED || this.status === OPERATION_STATUSES.CANCELLED;
    }

    get canStart() {
        return this.isPending && this.hasResources && this.stops.length > 0;
    }

    get pendingStopsCount() {
        return this.stops.filter(stop => stop.isPending).length;
    }

    get canComplete() {
        return this.isInProgress && this.stops.length > 0 && this.pendingStopsCount === 0;
    }

    get nextSequenceNumber() {
        return this.stops.reduce((highest, stop) => Math.max(highest, stop.sequenceNumber), 0) + 1;
    }

    get progress() {
        const countByStatus = status => this.stops.filter(stop => stop.status === status).length;
        return {
            total: this.stops.length,
            delivered: countByStatus(DELIVERY_STATUSES.DELIVERED),
            partiallyDelivered: countByStatus(DELIVERY_STATUSES.PARTIALLY_DELIVERED),
            notDelivered: countByStatus(DELIVERY_STATUSES.NOT_DELIVERED),
            pending: countByStatus(DELIVERY_STATUSES.PENDING)
        };
    }

    get registeredStopsCount() {
        return this.stops.length - this.pendingStopsCount;
    }
}
