import { Vehicle } from '../domain/model/vehicle.entity.js';
import { Driver } from '../domain/model/driver.entity.js';

export class VehicleAssembler {
    static toEntityFromResource(resource) {
        return new Vehicle({ ...resource });
    }

    static toEntitiesFromResponse(response) {
        return response.data.map(resource => this.toEntityFromResource(resource));
    }

    static toResourceFromEntity(vehicle) {
        return {
            organizationId: vehicle.organizationId,
            plateNumber: vehicle.plateNumber.trim().toUpperCase(),
            brand: vehicle.brand.trim(),
            model: vehicle.model.trim(),
            capacityInBoxes: vehicle.capacityInBoxes,
            status: vehicle.status
        };
    }
}

export class DriverAssembler {
    static toEntityFromResource(resource) {
        return new Driver({ ...resource });
    }

    static toEntitiesFromResponse(response) {
        return response.data.map(resource => this.toEntityFromResource(resource));
    }

    static toResourceFromEntity(driver) {
        return {
            organizationId: driver.organizationId,
            firstName: driver.firstName.trim(),
            lastName: driver.lastName.trim(),
            documentNumber: driver.documentNumber.trim(),
            licenseNumber: driver.licenseNumber.trim().toUpperCase(),
            phone: driver.phone.trim(),
            status: driver.status
        };
    }
}
