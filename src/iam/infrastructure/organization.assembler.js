import { Organization } from '../domain/model/organization.entity.js';

export class OrganizationAssembler {
    static toEntityFromResource(resource) {
        return new Organization({
            id: resource.id,
            businessName: resource.businessName,
            taxId: resource.taxId,
            email: resource.email,
            phone: resource.phone ?? '',
            address: resource.address ?? ''
        });
    }

    static toResourceFromUpdateCommand(command) {
        return {
            businessName: command.businessName,
            phone: command.phone,
            address: command.address
        };
    }
}
