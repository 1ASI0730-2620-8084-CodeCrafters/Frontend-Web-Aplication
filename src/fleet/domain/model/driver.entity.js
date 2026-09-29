export const DRIVER_STATUSES = Object.freeze({
    AVAILABLE: 'available',
    ASSIGNED: 'assigned',
    INACTIVE: 'inactive'
});

export const DOCUMENT_NUMBER_PATTERN = /^\d{8}$/;
export const LICENSE_NUMBER_PATTERN = /^[A-Z]\d{8}$/;

export class Driver {
    constructor({ id = null, organizationId = null, firstName = '', lastName = '', documentNumber = '', licenseNumber = '', phone = '', status = DRIVER_STATUSES.AVAILABLE }) {
        this.id = id;
        this.organizationId = organizationId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.documentNumber = documentNumber;
        this.licenseNumber = licenseNumber;
        this.phone = phone;
        this.status = status;
    }

    get fullName() {
        return `${this.firstName} ${this.lastName}`.trim();
    }

    get isAvailable() {
        return this.status === DRIVER_STATUSES.AVAILABLE;
    }
}
