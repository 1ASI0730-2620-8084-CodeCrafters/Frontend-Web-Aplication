import { DeliveryStop, TransportOperation } from '../domain/model/transport-operation.entity.js';
import { OPERATION_STATUSES } from '../domain/model/delivery-status.js';

export class TransportOperationAssembler {
    static toStopEntity(resource, deliveryPoints) {
        const deliveryPoint = deliveryPoints.find(point => point.id === resource.deliveryPointId);
        return new DeliveryStop({
            ...resource,
            deliveryPointName: deliveryPoint?.businessName ?? '',
            deliveryPointAddress: deliveryPoint?.address ?? '',
            deliveryPointDistrict: deliveryPoint?.district ?? '',
            latitude: deliveryPoint?.latitude ?? null,
            longitude: deliveryPoint?.longitude ?? null
        });
    }

    static toEntityFromResource(resource, { stops, vehicles, drivers, deliveryPoints }) {
        const vehicle = vehicles.find(item => item.id === resource.vehicleId);
        const driver = drivers.find(item => item.id === resource.driverId);
        return new TransportOperation({
            ...resource,
            stops: stops.filter(stop => stop.transportOperationId === resource.id).map(stop => this.toStopEntity(stop, deliveryPoints)),
            vehiclePlateNumber: vehicle?.plateNumber ?? '',
            vehicleLabel: vehicle ? `${vehicle.plateNumber} · ${vehicle.brand} ${vehicle.model}` : '',
            driverName: driver ? `${driver.firstName} ${driver.lastName}` : ''
        });
    }

    static toEntitiesFromResources(resources, references) {
        return resources
            .map(resource => this.toEntityFromResource(resource, references))
            .sort((first, second) => second.scheduledDate.localeCompare(first.scheduledDate) || second.code.localeCompare(first.code));
    }

    static toResourceFromCreateCommand(command, code) {
        return {
            id: crypto.randomUUID(),
            organizationId: command.organizationId,
            code,
            description: command.description,
            scheduledDate: command.scheduledDate,
            vehicleId: null,
            driverId: null,
            status: OPERATION_STATUSES.PENDING,
            dispatchedAt: null,
            completedAt: null,
            cancellationReason: null
        };
    }

    static toStopResourceFromCommand(command) {
        return {
            id: crypto.randomUUID(),
            transportOperationId: command.operation.id,
            deliveryPointId: command.deliveryPointId,
            sequenceNumber: command.operation.nextSequenceNumber,
            plannedQuantity: command.plannedQuantity,
            deliveredQuantity: null,
            status: 'pending',
            failureReason: null,
            confirmedAt: null
        };
    }

    static nextCode(operations) {
        const highest = operations.reduce((current, operation) => Math.max(current, Number(operation.code.replace(/\D/g, '')) || 0), 0);
        return `OP-${String(highest + 1).padStart(3, '0')}`;
    }
}
