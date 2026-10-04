export const ALERT_TYPES = Object.freeze({
    TEMPERATURE_OUT_OF_RANGE: 'temperature_out_of_range',
    IMPACT_DETECTED: 'impact_detected',
    DEVICE_OFFLINE: 'device_offline'
});

export const OFFLINE_THRESHOLD_MINUTES = 10;

const INCIDENT_TYPE_BY_ALERT = {
    temperature_out_of_range: 'damaged_product',
    impact_detected: 'broken_bottles',
    device_offline: 'delay'
};

export class SafeRange {
    constructor({ safeTemperatureMin, safeTemperatureMax, impactThreshold }) {
        this.safeTemperatureMin = safeTemperatureMin;
        this.safeTemperatureMax = safeTemperatureMax;
        this.impactThreshold = impactThreshold;
    }

    get validationError() {
        const values = [this.safeTemperatureMin, this.safeTemperatureMax, this.impactThreshold];
        if (values.some(value => value === null || value === undefined)) return 'range-required';
        if (this.safeTemperatureMin >= this.safeTemperatureMax) return 'minimum-not-below-maximum';
        if (this.impactThreshold <= 0) return 'threshold-not-positive';
        return null;
    }
}

export class SensorReading {
    constructor({ id = null, iotDeviceId = null, transportOperationId = null, recordedAt = '', latitude = null, longitude = null, temperatureCelsius = null, impactForce = null }) {
        this.id = id;
        this.iotDeviceId = iotDeviceId;
        this.transportOperationId = transportOperationId;
        this.recordedAt = recordedAt;
        this.latitude = latitude;
        this.longitude = longitude;
        this.temperatureCelsius = temperatureCelsius;
        this.impactForce = impactForce;
    }
}

export class IoTDevice {
    constructor({ id = null, serialNumber = '', vehicleId = null, vehiclePlateNumber = '', safeTemperatureMin = 2, safeTemperatureMax = 25, impactThreshold = 2.5, status = 'active' }) {
        this.id = id;
        this.serialNumber = serialNumber;
        this.vehicleId = vehicleId;
        this.vehiclePlateNumber = vehiclePlateNumber;
        this.safeTemperatureMin = safeTemperatureMin;
        this.safeTemperatureMax = safeTemperatureMax;
        this.impactThreshold = impactThreshold;
        this.status = status;
    }

    isTemperatureSafe(temperatureCelsius) {
        return temperatureCelsius >= this.safeTemperatureMin && temperatureCelsius <= this.safeTemperatureMax;
    }

    isImpactSafe(impactForce) {
        return impactForce <= this.impactThreshold;
    }

    evaluate(reading) {
        const alertTypes = [];
        if (!this.isTemperatureSafe(reading.temperatureCelsius)) alertTypes.push(ALERT_TYPES.TEMPERATURE_OUT_OF_RANGE);
        if (!this.isImpactSafe(reading.impactForce)) alertTypes.push(ALERT_TYPES.IMPACT_DETECTED);
        return alertTypes;
    }
}

export class Alert {
    constructor({ id = null, iotDeviceId = null, transportOperationId = null, type = '', raisedAt = '', acknowledgedBy = null, acknowledgedAt = null, operationCode = '' }) {
        this.id = id;
        this.iotDeviceId = iotDeviceId;
        this.transportOperationId = transportOperationId;
        this.type = type;
        this.raisedAt = raisedAt;
        this.acknowledgedBy = acknowledgedBy;
        this.acknowledgedAt = acknowledgedAt;
        this.operationCode = operationCode;
    }

    get isAcknowledged() {
        return this.acknowledgedAt !== null;
    }

    get incidentType() {
        return INCIDENT_TYPE_BY_ALERT[this.type];
    }
}

export class MonitoredOperation {
    constructor({ operationId, operationCode, description, vehiclePlateNumber, device = null, latestReading = null }) {
        this.operationId = operationId;
        this.operationCode = operationCode;
        this.description = description;
        this.vehiclePlateNumber = vehiclePlateNumber;
        this.device = device;
        this.latestReading = latestReading;
    }

    get hasDevice() {
        return this.device !== null;
    }

    get isCargoSafe() {
        return !this.latestReading || this.device.evaluate(this.latestReading).length === 0;
    }

    isOffline(now = new Date()) {
        if (!this.latestReading) return false;
        const elapsedMinutes = (now.getTime() - new Date(this.latestReading.recordedAt).getTime()) / 60000;
        return elapsedMinutes > OFFLINE_THRESHOLD_MINUTES;
    }
}
