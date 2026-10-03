import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { TransportOperationsApi } from '../infrastructure/transport-operations-api.js';
import { TransportOperationAssembler } from '../infrastructure/transport-operation.assembler.js';
import { OPERATION_STATUSES } from '../domain/model/delivery-status.js';

const AVAILABLE = 'available';
const ASSIGNED = 'assigned';
const transportOperationsApi = new TransportOperationsApi();

const useTransportOperationsStore = defineStore('transport-operations', () => {
    const operations = ref([]);
    const operationsLoaded = ref(false);
    const currentOperation = ref(null);
    const vehicles = ref([]);
    const drivers = ref([]);
    const deliveryPoints = ref([]);
    const isSaving = ref(false);

    const availableVehicles = computed(() => vehicles.value.filter(vehicle => vehicle.status === AVAILABLE));
    const availableDrivers = computed(() => drivers.value.filter(driver => driver.status === AVAILABLE));

    async function fetchReferences(organizationId) {
        const [vehiclesResponse, driversResponse, pointsResponse] = await Promise.all([
            transportOperationsApi.getVehicles(organizationId),
            transportOperationsApi.getDrivers(organizationId),
            transportOperationsApi.getDeliveryPoints(organizationId)
        ]);
        vehicles.value = vehiclesResponse.data;
        drivers.value = driversResponse.data;
        deliveryPoints.value = pointsResponse.data;
    }

    function references(stops) {
        return { stops, vehicles: vehicles.value, drivers: drivers.value, deliveryPoints: deliveryPoints.value };
    }

    async function fetchOperations(organizationId) {
        await fetchReferences(organizationId);
        const { data: operationResources } = await transportOperationsApi.getOperations(organizationId);
        const stops = operationResources.length ? (await transportOperationsApi.getStopsByOperations(operationResources.map(item => item.id))).data : [];
        operations.value = TransportOperationAssembler.toEntitiesFromResources(operationResources, references(stops));
        operationsLoaded.value = true;
    }

    async function fetchOperation(operationId) {
        const { data: operationResource } = await transportOperationsApi.getOperationById(operationId);
        await fetchReferences(operationResource.organizationId);
        const { data: stops } = await transportOperationsApi.getStopsByOperations([operationId]);
        currentOperation.value = TransportOperationAssembler.toEntityFromResource(operationResource, references(stops));
    }

    async function runOnOperation(operation, action) {
        isSaving.value = true;
        try {
            const error = await action();
            await fetchOperation(operation.id);
            return error ?? null;
        } catch {
            return 'request-failed';
        } finally {
            isSaving.value = false;
        }
    }

    async function createOperation(command) {
        isSaving.value = true;
        try {
            const { data: existing } = await transportOperationsApi.getOperations(command.organizationId);
            const resource = TransportOperationAssembler.toResourceFromCreateCommand(command, TransportOperationAssembler.nextCode(existing));
            const { data } = await transportOperationsApi.createOperation(resource);
            return { operationId: data.id, error: null };
        } catch {
            return { operationId: null, error: 'request-failed' };
        } finally {
            isSaving.value = false;
        }
    }

    function assignResource(operation, resourceId, { field, getById, setStatus }) {
        return runOnOperation(operation, async () => {
            if (!operation.isPending) return 'operation-not-pending';
            const { data: resource } = await getById(resourceId);
            if (resource.status !== AVAILABLE) return 'resource-not-available';
            if (operation[field]) await setStatus(operation[field], AVAILABLE);
            await setStatus(resourceId, ASSIGNED);
            await transportOperationsApi.updateOperation(operation.id, { [field]: resourceId });
            return null;
        });
    }

    function assignVehicle(operation, vehicleId) {
        return assignResource(operation, vehicleId, {
            field: 'vehicleId',
            getById: id => transportOperationsApi.getVehicleById(id),
            setStatus: (id, status) => transportOperationsApi.setVehicleStatus(id, status)
        });
    }

    function assignDriver(operation, driverId) {
        return assignResource(operation, driverId, {
            field: 'driverId',
            getById: id => transportOperationsApi.getDriverById(id),
            setStatus: (id, status) => transportOperationsApi.setDriverStatus(id, status)
        });
    }

    function addDeliveryStop(command) {
        return runOnOperation(command.operation, async () => {
            if (!command.operation.isPending) return 'operation-not-pending';
            await transportOperationsApi.createStop(TransportOperationAssembler.toStopResourceFromCommand(command));
            return null;
        });
    }

    function startOperation(operation) {
        return runOnOperation(operation, async () => {
            if (!operation.canStart) return 'operation-cannot-start';
            await transportOperationsApi.updateOperation(operation.id, { status: OPERATION_STATUSES.IN_PROGRESS, dispatchedAt: new Date().toISOString() });
            return null;
        });
    }

    function recordDelivery(operation, command) {
        return runOnOperation(operation, async () => {
            if (!operation.isInProgress || !command.stop.isPending || !command.isValid) return 'delivery-not-recordable';
            await transportOperationsApi.updateStop(command.stop.id, {
                status: command.status,
                deliveredQuantity: command.deliveredQuantity,
                failureReason: command.failureReason,
                confirmedAt: new Date().toISOString()
            });
            return null;
        });
    }

    function completeOperation(operation) {
        return runOnOperation(operation, async () => {
            if (!operation.canComplete) return 'operation-has-pending-deliveries';
            await transportOperationsApi.updateOperation(operation.id, { status: OPERATION_STATUSES.COMPLETED, completedAt: new Date().toISOString() });
            await transportOperationsApi.setVehicleStatus(operation.vehicleId, AVAILABLE);
            await transportOperationsApi.setDriverStatus(operation.driverId, AVAILABLE);
            return null;
        });
    }

    function cancelOperation(operation, reason) {
        return runOnOperation(operation, async () => {
            if (!operation.canCancel) return 'operation-already-started';
            if (!reason.trim()) return 'cancellation-reason-required';
            await transportOperationsApi.updateOperation(operation.id, { status: OPERATION_STATUSES.CANCELLED, cancellationReason: reason.trim() });
            if (operation.vehicleId) await transportOperationsApi.setVehicleStatus(operation.vehicleId, AVAILABLE);
            if (operation.driverId) await transportOperationsApi.setDriverStatus(operation.driverId, AVAILABLE);
            return null;
        });
    }

    function moveStop(operation, stop, offset) {
        return runOnOperation(operation, async () => {
            if (!operation.isPending) return 'operation-not-pending';
            const index = operation.stops.findIndex(item => item.id === stop.id);
            const neighbour = operation.stops[index + offset];
            if (!neighbour) return null;
            await transportOperationsApi.updateStop(stop.id, { sequenceNumber: neighbour.sequenceNumber });
            await transportOperationsApi.updateStop(neighbour.id, { sequenceNumber: stop.sequenceNumber });
            return null;
        });
    }

    return {
        operations,
        operationsLoaded,
        currentOperation,
        deliveryPoints,
        availableVehicles,
        availableDrivers,
        isSaving,
        fetchOperations,
        fetchOperation,
        createOperation,
        assignVehicle,
        assignDriver,
        addDeliveryStop,
        startOperation,
        recordDelivery,
        completeOperation,
        cancelOperation,
        moveStop
    };
});

export default useTransportOperationsStore;
