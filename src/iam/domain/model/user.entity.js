import { USER_ROLES } from './user-role.js';

const ACTIVE_STATUS = 'active';

export class User {
    constructor({ id = null, organizationId = null, firstName = '', lastName = '', email = '', role = USER_ROLES.FLEET_SUPERVISOR, status = ACTIVE_STATUS }) {
        this.id = id;
        this.organizationId = organizationId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.role = role;
        this.status = status;
    }

    get fullName() {
        return `${this.firstName} ${this.lastName}`.trim();
    }

    get initials() {
        return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
    }

    get isActive() {
        return this.status === ACTIVE_STATUS;
    }

    hasAnyRole(roles) {
        return roles.length === 0 || roles.includes(this.role);
    }
}
