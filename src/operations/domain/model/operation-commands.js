import { DELIVERY_STATUSES } from './delivery-status.js';

export class CreateOperationCommand {
    constructor({ organizationId, description, scheduledDate }) {
        this.organizationId = organizationId;
        this.description = description.trim();
        this.scheduledDate = scheduledDate;
    }
}

export class AddDeliveryStopCommand {
    constructor({ operation, deliveryPointId, plannedQuantity }) {
        this.operation = operation;
        this.deliveryPointId = deliveryPointId;
        this.plannedQuantity = plannedQuantity;
    }
}

export class RecordDeliveryCommand {
    constructor({ stop, status, deliveredQuantity, failureReason }) {
        this.stop = stop;
        this.status = status;
        this.deliveredQuantity = this.resolveDeliveredQuantity(status, deliveredQuantity, stop.plannedQuantity);
        this.failureReason = status === DELIVERY_STATUSES.DELIVERED ? null : failureReason.trim();
    }

    resolveDeliveredQuantity(status, deliveredQuantity, plannedQuantity) {
        if (status === DELIVERY_STATUSES.DELIVERED) return plannedQuantity;
        if (status === DELIVERY_STATUSES.NOT_DELIVERED) return 0;
        return deliveredQuantity;
    }

    get isValid() {
        if (this.status === DELIVERY_STATUSES.DELIVERED) return true;
        if (!this.failureReason) return false;
        if (this.status === DELIVERY_STATUSES.NOT_DELIVERED) return true;
        return this.deliveredQuantity > 0 && this.deliveredQuantity < this.stop.plannedQuantity;
    }
}
