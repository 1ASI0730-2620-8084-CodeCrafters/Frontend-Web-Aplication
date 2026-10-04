import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { MonitoringApi } from '../infrastructure/monitoring-api.js';
import { MonitoringAssembler } from '../infrastructure/monitoring.assemblers.js';
import { SensorReading } from '../domain/model/iot-device.entity.js';

const IN_PROGRESS = 'in_progress';
const monitoringApi = new MonitoringApi();

const useMonitoringStore = defineStore('monitoring', () => {
    const monitoredOperations = ref([]);
    const alerts = ref([]);
    const monitoringLoaded = ref(false);
    const isSaving = ref(false);
    const devices = ref([]);
    const devicesLoaded = ref(false);

    const pendingAlerts = computed(() => alerts.value.filter(alert => !alert.isAcknowledged));

    async function fetchMonitoring(organizationId) {
        const [{ data: operations }, { data: vehicles }] = await Promise.all([
            monitoringApi.getOperations(organizationId, IN_PROGRESS),
            monitoringApi.getVehicles(organizationId)
        ]);
        const vehicleIds = operations.map(operation => operation.vehicleId).filter(Boolean);
        const devices = vehicleIds.length ? (await monitoringApi.getDevicesByVehicles(vehicleIds)).data : [];
        const readingResponses = await Promise.all(operations.map(operation => monitoringApi.getLatestReading(operation.id)));
        const latestReadings = Object.fromEntries(operations.map((operation, index) => [operation.id, readingResponses[index].data[0]]));
        monitoredOperations.value = operations.map(operation => MonitoringAssembler.toMonitoredOperation(operation, { vehicles, devices, latestReadings }));
        const alertResources = operations.length ? (await monitoringApi.getAlertsByOperations(operations.map(operation => operation.id))).data : [];
        alerts.value = alertResources.map(resource => MonitoringAssembler.toAlert(resource, operations));
        monitoringLoaded.value = true;
    }

    async function simulateReading(monitoredOperation, organizationId) {
        if (!monitoredOperation.hasDevice) return { alertTypes: [], error: 'device-missing' };
        isSaving.value = true;
        try {
            const resource = MonitoringAssembler.toSimulatedReadingResource(monitoredOperation);
            await monitoringApi.createReading(resource);
            const alertTypes = monitoredOperation.device.evaluate(new SensorReading(resource));
            await Promise.all(alertTypes.map(type => monitoringApi.createAlert(MonitoringAssembler.toAlertResource(resource, type))));
            await fetchMonitoring(organizationId);
            return { alertTypes, error: null };
        } catch {
            return { alertTypes: [], error: 'request-failed' };
        } finally {
            isSaving.value = false;
        }
    }

    async function acknowledgeAlert(alert, userId) {
        try {
            const { data } = await monitoringApi.acknowledgeAlert(alert.id, { acknowledgedBy: userId, acknowledgedAt: new Date().toISOString() });
            alerts.value = alerts.value.map(item => (item.id === alert.id ? MonitoringAssembler.toAlert(data, [{ id: alert.transportOperationId, code: alert.operationCode }]) : item));
            return null;
        } catch {
            return 'request-failed';
        }
    }

    async function fetchDevices(organizationId) {
        const { data: vehicles } = await monitoringApi.getVehicles(organizationId);
        const vehicleIds = vehicles.map(vehicle => vehicle.id);
        const resources = vehicleIds.length ? (await monitoringApi.getDevicesByVehicles(vehicleIds)).data : [];
        devices.value = resources.map(resource => MonitoringAssembler.toDevice(resource, vehicles));
        devicesLoaded.value = true;
    }

    async function updateSafeRange(device, safeRange) {
        if (safeRange.validationError) return safeRange.validationError;
        isSaving.value = true;
        try {
            const { data } = await monitoringApi.updateDevice(device.id, { ...safeRange });
            devices.value = devices.value.map(item => (item.id === device.id ? MonitoringAssembler.toDevice(data, [{ id: device.vehicleId, plateNumber: device.vehiclePlateNumber }]) : item));
            return null;
        } catch {
            return 'request-failed';
        } finally {
            isSaving.value = false;
        }
    }

    async function reportIncidentFromAlert(alert, { reportedBy, description }) {
        isSaving.value = true;
        try {
            const { data: [latestIncident] } = await monitoringApi.getLatestIncident();
            await monitoringApi.createIncident(MonitoringAssembler.toIncidentResourceFromAlert(alert, { reportedBy, description, latestIncident }));
            return await acknowledgeAlert(alert, reportedBy);
        } catch {
            return 'request-failed';
        } finally {
            isSaving.value = false;
        }
    }

    return {
        devices,
        devicesLoaded,
        fetchDevices,
        updateSafeRange,
        reportIncidentFromAlert,
        monitoredOperations,
        alerts,
        pendingAlerts,
        monitoringLoaded,
        isSaving,
        fetchMonitoring,
        simulateReading,
        acknowledgeAlert
    };
});

export default useMonitoringStore;
