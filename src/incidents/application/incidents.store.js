import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { IncidentsApi } from '../infrastructure/incidents-api.js';
import { IncidentAssembler, EvidenceAssembler } from '../infrastructure/incident.assembler.js';

const incidentsApi = new IncidentsApi();

const useIncidentsStore = defineStore('incidents', () => {
    const incidents = ref([]);
    const operations = ref([]);
    const stops = ref([]);
    const incidentsLoaded = ref(false);
    const isSaving = ref(false);
    const evidences = ref([]);
    const evidencesLoaded = ref(false);

    const openIncidents = computed(() => incidents.value.filter(incident => incident.isOpen));
    const reportableOperations = computed(() => operations.value.filter(operation => operation.status !== 'cancelled'));

    async function fetchIncidents(organizationId) {
        const { data: operationResources } = await incidentsApi.getOperations(organizationId);
        operations.value = operationResources;
        const operationIds = operationResources.map(operation => operation.id);
        if (operationIds.length === 0) {
            incidents.value = [];
            stops.value = [];
        } else {
            const [incidentsResponse, stopsResponse] = await Promise.all([
                incidentsApi.getIncidentsByOperations(operationIds),
                incidentsApi.getStopsByOperations(operationIds)
            ]);
            incidents.value = IncidentAssembler.toEntitiesFromResources(incidentsResponse.data, operationResources);
            stops.value = stopsResponse.data;
        }
        incidentsLoaded.value = true;
    }

    async function runSaving(action) {
        isSaving.value = true;
        try {
            return await action();
        } catch {
            return 'request-failed';
        } finally {
            isSaving.value = false;
        }
    }

    function reportIncident(command) {
        return runSaving(async () => {
            if (!command.isValid) return 'invalid-incident';
            const resource = IncidentAssembler.toResourceFromReportCommand(command, IncidentAssembler.nextCode(incidents.value));
            const { data } = await incidentsApi.createIncident(resource);
            incidents.value = [IncidentAssembler.toEntityFromResource(data, operations.value), ...incidents.value];
            return null;
        });
    }

    async function fetchEvidences(incidentId) {
        evidences.value = [];
        evidencesLoaded.value = false;
        const { data } = await incidentsApi.getEvidencesByIncident(incidentId);
        evidences.value = EvidenceAssembler.toEntitiesFromResources(data);
        evidencesLoaded.value = true;
    }

    function attachEvidence(command) {
        return runSaving(async () => {
            if (!command.isValid) return 'invalid-evidence';
            const resource = EvidenceAssembler.toResourceFromCommand(command);
            const { data } = await incidentsApi.createEvidence(resource);
            evidences.value = [...evidences.value, EvidenceAssembler.toEntityFromResource(data)];
            return null;
        });
    }

    function advanceIncident(command) {
        return runSaving(async () => {
            if (!command.isValid) return 'invalid-transition';
            const { data } = await incidentsApi.updateIncident(command.incident.id, IncidentAssembler.toChangesFromAdvanceCommand(command));
            const updated = IncidentAssembler.toEntityFromResource(data, operations.value);
            incidents.value = incidents.value.map(incident => (incident.id === updated.id ? updated : incident));
            return null;
        });
    }

    return {
        incidents,
        operations,
        stops,
        openIncidents,
        reportableOperations,
        incidentsLoaded,
        evidences,
        evidencesLoaded,
        isSaving,
        fetchIncidents,
        reportIncident,
        advanceIncident,
        fetchEvidences,
        attachEvidence
    };
});

export default useIncidentsStore;
