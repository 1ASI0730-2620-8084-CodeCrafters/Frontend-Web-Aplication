export class RegisterUserCommand {
    constructor({ organizationId, firstName, lastName, email, role, password }) {
        this.organizationId = organizationId;
        this.firstName = firstName.trim();
        this.lastName = lastName.trim();
        this.email = email.trim().toLowerCase();
        this.role = role;
        this.password = password;
    }
}

export class UpdateUserCommand {
    constructor({ userId, firstName, lastName, email }) {
        this.userId = userId;
        this.firstName = firstName.trim();
        this.lastName = lastName.trim();
        this.email = email.trim().toLowerCase();
    }
}

export class AssignRoleCommand {
    constructor({ userId, role }) {
        this.userId = userId;
        this.role = role;
    }
}

export class UpdateOrganizationCommand {
    constructor({ organizationId, businessName, phone, address }) {
        this.organizationId = organizationId;
        this.businessName = businessName.trim();
        this.phone = phone.trim();
        this.address = address.trim();
    }
}
