import { User } from '../domain/model/user.entity.js';

export class UserAssembler {
    static toEntityFromResource(resource) {
        return new User({
            id: resource.id,
            organizationId: resource.organizationId,
            firstName: resource.firstName,
            lastName: resource.lastName,
            email: resource.email,
            role: resource.role,
            status: resource.status
        });
    }

    static toResourceFromEntity(user) {
        return {
            id: user.id,
            organizationId: user.organizationId,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            status: user.status
        };
    }

    static toEntitiesFromResponse(response) {
        return response.data.map(resource => this.toEntityFromResource(resource));
    }

    static toResourceFromRegisterCommand(command) {
        return {
            id: crypto.randomUUID(),
            organizationId: command.organizationId,
            firstName: command.firstName,
            lastName: command.lastName,
            email: command.email,
            password: command.password,
            role: command.role,
            status: 'active',
            createdAt: new Date().toISOString()
        };
    }

    static toResourceFromUpdateCommand(command) {
        return {
            firstName: command.firstName,
            lastName: command.lastName,
            email: command.email
        };
    }
}
