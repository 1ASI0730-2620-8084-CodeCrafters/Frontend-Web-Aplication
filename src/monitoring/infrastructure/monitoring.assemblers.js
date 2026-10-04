import { Alert, IoTDevice, MonitoredOperation, SensorReading } from '../domain/model/iot-device.entity.js';

const IOT_ALERT_SOURCE = 'iot_alert';

export class MonitoringAssembler {
    static toMonitoredOperation(operation, { vehicles, devices, latestReadings }) {
        const vehicle = vehicles.find(item => item.id === operation.vehicleId);
        const deviceResource = devices.find(device => device.vehicleId === operation.vehicleId);
        const readingResource = latestReadings[operation.id];
        return new MonitoredOperation({
            operationId: operation.id,
            operationCode: operation.code,
            description: operation.description,
            vehiclePlateNumber: vehicle?.plateNumber ?? '',
            device: deviceResource ? new IoTDevice(deviceResource) : null,
            latestReading: readingResource ? new SensorReading(readingResource) : null
        });
    }

    static toDevice(resource, vehicles) {
        const vehicle = vehicles.find(item => item.id === resource.vehicleId);
        return new IoTDevice({ ...resource, vehiclePlateNumber: vehicle?.plateNumber ?? '' });
    }

    static toIncidentResourceFromAlert(alert, { reportedBy, description, latestIncident }) {
        const lastNumber = Number(latestIncident?.code.replace(/\D/g, '')) || 0;
        return {
            id: crypto.randomUUID(),
            code: `INC-${String(lastNumber + 1).padStart(4, '0')}`,
            transportOperationId: alert.transportOperationId,
            deliveryStopId: null,
            reportedBy,
            source: IOT_ALERT_SOURCE,
            type: alert.incidentType,
            severity: 'high',
            description,
            affectedQuantity: 0,
            status: 'reported',
            resolution: null,
            reportedAt: new Date().toISOString(),
            resolvedAt: null
        };
    }

    static toAlert(resource, operations) {
        const operation = operations.find(item => item.id === resource.transportOperationId);
        return new Alert({ ...resource, operationCode: operation?.code ?? '' });
    }

    static toSimulatedReadingResource(monitoredOperation) {
        const previous = monitoredOperation.latestReading;
        const isRiskyReading = Math.random() < 0.35;
        const temperatureCelsius = isRiskyReading ? 26 + Math.random() * 4 : 6 + Math.random() * 10;
        const impactForce = isRiskyReading && Math.random() < 0.5 ? 2.6 + Math.random() * 2 : Math.random() * 1.5;
        return {
            id: crypto.randomUUID(),
            iotDeviceId: monitoredOperation.device.id,
            transportOperationId: monitoredOperation.operationId,
            recordedAt: new Date().toISOString(),
            latitude: Number(((previous?.latitude ?? -12.0464) - Math.random() * 0.004).toFixed(6)),
            longitude: Number(((previous?.longitude ?? -77.0428) - Math.random() * 0.004).toFixed(6)),
            temperatureCelsius: Number(temperatureCelsius.toFixed(1)),
            impactForce: Number(impactForce.toFixed(2))
        };
    }

    static toAlertResource(reading, type) {
        return {
            id: crypto.randomUUID(),
            iotDeviceId: reading.iotDeviceId,
            transportOperationId: reading.transportOperationId,
            type,
            raisedAt: reading.recordedAt,
            acknowledgedBy: null,
            acknowledgedAt: null
        };
    }
}
