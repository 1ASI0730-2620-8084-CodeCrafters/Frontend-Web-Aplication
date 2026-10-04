export const VEHICLE_STATUSES = Object.freeze({
    AVAILABLE: 'available',
    ASSIGNED: 'assigned',
    IN_MAINTENANCE: 'in_maintenance'
});

export const PLATE_NUMBER_PATTERN = /^[A-Z0-9]{3}-[A-Z0-9]{3}$/;

export class Vehicle {
    constructor({ id = null, organizationId = null, plateNumber = '', brand = '', model = '', capacityInBoxes = null, status = VEHICLE_STATUSES.AVAILABLE }) {
        this.id = id;
        this.organizationId = organizationId;
        this.plateNumber = plateNumber;
        this.brand = brand;
        this.model = model;
        this.capacityInBoxes = capacityInBoxes;
        this.status = status;
    }

    get description() {
        return `${this.brand} ${this.model}`.trim();
    }

    get isAvailable() {
        return this.status === VEHICLE_STATUSES.AVAILABLE;
    }
}
