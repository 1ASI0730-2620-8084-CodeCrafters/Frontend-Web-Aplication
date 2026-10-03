import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { OperationsApi } from '../infrastructure/operations-api.js';
import { DeliveryOrderAssembler } from '../infrastructure/delivery-order.assembler.js';
import { IncidentAssembler } from '../infrastructure/incident.assembler.js';

const operationsApi = new OperationsApi();

function uniqueValues(values) {
    return [...new Set(values)];
}

const useOperationsStore = defineStore('operations', () => {
    const deliveryOrders = ref([]);
    const isLoading = ref(false);
    const loadError = ref(false);
    const isReporting = ref(false);

    const activeDeliveryOrders = computed(() => deliveryOrders.value
        .filter(order => !order.isRegistered)
        .sort((first, second) => first.scheduledDate.localeCompare(second.scheduledDate)));
    const registeredDeliveryOrders = computed(() => deliveryOrders.value.filter(order => order.isRegistered));

    async function fetchDeliveryOrders(ownerUserId) {
        isLoading.value = true;
        loadError.value = false;
        try {
            const { data: deliveryPoints } = await operationsApi.getDeliveryPointsByOwner(ownerUserId);
            if (deliveryPoints.length === 0) {
                deliveryOrders.value = [];
                return;
            }
            const { data: stops } = await operationsApi.getDeliveryStopsByDeliveryPoints(deliveryPoints.map(point => point.id));
            if (stops.length === 0) {
                deliveryOrders.value = [];
                return;
            }
            const operationIds = uniqueValues(stops.map(stop => stop.transportOperationId));
            const [operationsResponse, operationStopsResponse, incidentsResponse] = await Promise.all([
                operationsApi.getTransportOperationsByIds(operationIds),
                operationsApi.getDeliveryStopsByOperations(operationIds),
                operationsApi.getIncidentsByDeliveryStops(stops.map(stop => stop.id))
            ]);
            deliveryOrders.value = DeliveryOrderAssembler.toEntitiesFromResources({
                stops,
                operations: operationsResponse.data,
                deliveryPoints,
                operationStops: operationStopsResponse.data,
                incidents: incidentsResponse.data
            });
        } catch {
            loadError.value = true;
        } finally {
            isLoading.value = false;
        }
    }

    async function reportReceptionProblem(command) {
        if (!command.isValid || !command.deliveryOrder.canReportProblem) return false;
        isReporting.value = true;
        try {
            const { data: [latestIncident] } = await operationsApi.getLatestIncident();
            await operationsApi.createIncident(IncidentAssembler.toResourceFromCommand(command, IncidentAssembler.nextCode(latestIncident)));
            command.deliveryOrder.hasReportedProblem = true;
            return true;
        } catch {
            return false;
        } finally {
            isReporting.value = false;
        }
    }

    return {
        deliveryOrders,
        activeDeliveryOrders,
        registeredDeliveryOrders,
        isLoading,
        loadError,
        isReporting,
        fetchDeliveryOrders,
        reportReceptionProblem
    };
});

export default useOperationsStore;
