<script setup>
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import useIncidentsStore from '../../application/incidents.store.js';
import useIamStore from '../../../iam/application/iam.store.js';
import { AdvanceIncidentCommand, INCIDENT_STATUSES, INCIDENT_TYPES, ReportIncidentCommand } from '../../domain/model/incident.entity.js';
import { AttachEvidenceCommand } from '../../domain/model/evidence.entity.js';
import StatusBadge from '../../../shared/presentation/components/status-badge.vue';
import { formatDateTime } from '../../../shared/presentation/date-format.js';
import ReportIncidentDialog from '../components/report-incident-dialog.vue';
import AdvanceIncidentDialog from '../components/advance-incident-dialog.vue';
import AttachEvidenceDialog from '../components/attach-evidence-dialog.vue';

const STATUS_TONES = { reported: 'danger', under_review: 'warning', resolved: 'success', closed: 'neutral' };
const SEVERITY_TONES = { low: 'neutral', medium: 'info', high: 'warning', critical: 'danger' };

const { t, locale } = useI18n();
const toast = useToast();
const store = useIncidentsStore();
const iamStore = useIamStore();

const loadFailed = ref(false);
const isReportVisible = ref(false);
const isAdvanceVisible = ref(false);
const selectedIncident = ref(null);
const isEvidenceVisible = ref(false);
const statusFilter = ref(null);
const typeFilter = ref(null);

const statusOptions = computed(() => Object.values(INCIDENT_STATUSES).map(status => ({ value: status, label: t(`incidents.statuses.${status}`) })));
const typeOptions = computed(() => INCIDENT_TYPES.map(type => ({ value: type, label: t(`incidents.types.${type}`) })));
const filteredIncidents = computed(() => store.incidents.filter(incident =>
    (!statusFilter.value || incident.status === statusFilter.value) && (!typeFilter.value || incident.type === typeFilter.value)));

function notify(error, successKey, params = {}) {
    toast.add({ severity: error ? 'error' : 'success', summary: t(error ? 'shared.form.failure' : successKey, params), life: 4000 });
}

async function reportIncident(formValues) {
    const error = await store.reportIncident(new ReportIncidentCommand({ ...formValues, reportedBy: iamStore.currentUser.id }));
    if (!error) isReportVisible.value = false;
    notify(error, 'incidents.form.success');
}

function openAdvanceDialog(incident) {
    selectedIncident.value = incident;
    isAdvanceVisible.value = true;
}

async function advanceIncident(resolution) {
    const command = new AdvanceIncidentCommand({ incident: selectedIncident.value, resolution });
    const error = await store.advanceIncident(command);
    if (!error) isAdvanceVisible.value = false;
    notify(error, 'incidents.advance.success', { code: command.incident.code, status: t(`incidents.statuses.${command.nextStatus}`) });
}

async function openEvidenceDialog(incident) {
    selectedIncident.value = incident;
    isEvidenceVisible.value = true;
    await store.fetchEvidences(incident.id).catch(() => notify('request-failed'));
}

async function attachEvidence(fileUrl) {
    const command = new AttachEvidenceCommand({
        incidentId: selectedIncident.value.id,
        fileUrl,
        uploadedBy: iamStore.currentUser.id
    });
    const error = await store.attachEvidence(command);
    if (!error) isEvidenceVisible.value = false;
    notify(error, 'incidents.evidence.success');
}

onMounted(() => store.fetchIncidents(iamStore.currentUser.organizationId).catch(() => {
    loadFailed.value = true;
}));
</script>

<template>
    <section class="page" aria-labelledby="incidents-title">
        <div class="page__header">
            <div>
                <h1 id="incidents-title" class="page__title">{{ t('incidents.list.title') }}</h1>
                <p class="page__lead">{{ t('incidents.list.lead') }}</p>
            </div>
            <pv-button :label="t('incidents.list.new')" icon="pi pi-plus" @click="isReportVisible = true"/>
        </div>
        <div class="list-filters">
            <pv-select v-model="statusFilter" :options="statusOptions" option-label="label" option-value="value" :placeholder="t('incidents.list.all-statuses')" show-clear :aria-label="t('incidents.list.filter-status')"/>
            <pv-select v-model="typeFilter" :options="typeOptions" option-label="label" option-value="value" :placeholder="t('incidents.list.all-types')" show-clear :aria-label="t('incidents.list.filter-type')"/>
        </div>
        <pv-message v-if="loadFailed" severity="error" role="alert">{{ t('shared.load-error') }}</pv-message>
        <div v-else class="panel panel--table">
            <pv-data-table :value="filteredIncidents" :loading="!store.incidentsLoaded" data-key="id" scrollable>
                <template #empty>{{ t('incidents.list.empty') }}</template>
                <pv-column field="code" :header="t('incidents.list.code')"/>
                <pv-column field="operationCode" :header="t('incidents.list.operation')"/>
                <pv-column :header="t('incidents.form.type')">
                    <template #body="{ data }">{{ t(`incidents.types.${data.type}`) }}</template>
                </pv-column>
                <pv-column :header="t('incidents.form.severity')">
                    <template #body="{ data }">
                        <status-badge :label="t(`incidents.severities.${data.severity}`)" :tone="SEVERITY_TONES[data.severity]"/>
                    </template>
                </pv-column>
                <pv-column :header="t('incidents.list.source')">
                    <template #body="{ data }">{{ t(`incidents.sources.${data.source}`) }}</template>
                </pv-column>
                <pv-column :header="t('incidents.list.reported-at')">
                    <template #body="{ data }">{{ formatDateTime(data.reportedAt, locale) }}</template>
                </pv-column>
                <pv-column :header="t('incidents.list.status')">
                    <template #body="{ data }">
                        <status-badge :label="t(`incidents.statuses.${data.status}`)" :tone="STATUS_TONES[data.status]"/>
                    </template>
                </pv-column>
                <pv-column :header="t('shared.actions')">
                    <template #body="{ data }">
                        <pv-button
                            :label="t('incidents.evidence.attach')"
                            icon="pi pi-paperclip"
                            size="small"
                            text
                            :aria-label="t('incidents.evidence.attach-aria', { code: data.code })"
                            @click="openEvidenceDialog(data)"/>
                        <pv-button
                            v-if="data.nextStatus"
                            :label="t(`incidents.advance.to.${data.nextStatus}`)"
                            size="small"
                            text
                            :aria-label="t('incidents.advance.title', { code: data.code })"
                            @click="openAdvanceDialog(data)"/>
                    </template>
                </pv-column>
            </pv-data-table>
        </div>
        <report-incident-dialog v-model:visible="isReportVisible" :operations="store.reportableOperations" :is-saving="store.isSaving" @submit="reportIncident"/>
        <advance-incident-dialog v-model:visible="isAdvanceVisible" :incident="selectedIncident" :is-saving="store.isSaving" @submit="advanceIncident"/>
        <attach-evidence-dialog v-model:visible="isEvidenceVisible" :incident="selectedIncident" :evidences="store.evidences" :evidences-loaded="store.evidencesLoaded" :is-saving="store.isSaving" @submit="attachEvidence"/>
    </section>
</template>
