<script setup>
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import useIamStore from '../../application/iam.store.js';
import { USER_ROLES } from '../../domain/model/user-role.js';
import { AssignRoleCommand, RegisterUserCommand, UpdateUserCommand } from '../../domain/model/user-commands.js';
import UserFormDialog from '../components/user-form-dialog.vue';

const { t } = useI18n();
const toast = useToast();
const store = useIamStore();

const loadFailed = ref(false);
const isDialogVisible = ref(false);
const selectedUser = ref(null);
const formError = ref(null);

const currentUserId = computed(() => store.currentUser?.id ?? null);
const roleOptions = computed(() => Object.values(USER_ROLES).map(role => ({ value: role, label: t(`iam.roles.${role}`) })));

function notify(severity, summary) {
    toast.add({ severity, summary, life: 4000 });
}

function openDialog(user = null) {
    selectedUser.value = user;
    formError.value = null;
    isDialogVisible.value = true;
}

async function saveUser(formValues) {
    const isEditing = selectedUser.value !== null;
    const error = isEditing
        ? await store.updateUser(new UpdateUserCommand({ userId: selectedUser.value.id, ...formValues }))
        : await store.registerUser(new RegisterUserCommand({ organizationId: store.currentUser?.organizationId, ...formValues }));
    formError.value = error;
    if (error === 'email-taken') return;
    if (error) {
        notify('error', t('iam.users.failure'));
        return;
    }
    isDialogVisible.value = false;
    const name = `${formValues.firstName} ${formValues.lastName}`.trim();
    notify('success', t(isEditing ? 'iam.users.updated' : 'iam.users.created', { name }));
}

async function changeRole(user, role) {
    const error = await store.assignRole(new AssignRoleCommand({ userId: user.id, role }));
    if (error) notify('error', t('iam.users.failure'));
    else notify('success', t('iam.users.role-success', { name: user.fullName, role: t(`iam.roles.${role}`) }));
}

onMounted(() => store.fetchUsers().catch(() => {
    loadFailed.value = true;
}));
</script>

<template>
    <section class="page" aria-labelledby="users-title">
        <div class="users__header">
            <div>
                <h1 id="users-title" class="page__title">{{ t('iam.users.title') }}</h1>
                <p class="page__lead">{{ t('iam.users.lead') }}</p>
            </div>
            <pv-button :label="t('iam.users.new')" icon="pi pi-plus" @click="openDialog()"/>
        </div>
        <pv-message v-if="loadFailed" severity="error" role="alert">{{ t('iam.users.load-error') }}</pv-message>
        <div v-else class="panel users__table">
            <pv-data-table :value="store.users" :loading="!store.usersLoaded" data-key="id" sort-field="lastName" :sort-order="1" scrollable>
                <template #empty>{{ t('iam.users.empty') }}</template>
                <pv-column field="lastName" :header="t('iam.users.name')" sortable>
                    <template #body="{ data }">
                        <span>{{ data.fullName }}</span>
                        <span v-if="data.id === currentUserId" class="users__you">{{ t('iam.users.you') }}</span>
                    </template>
                </pv-column>
                <pv-column field="email" :header="t('iam.users.email')" sortable/>
                <pv-column field="role" :header="t('iam.users.role')">
                    <template #body="{ data }">
                        <pv-select
                            :model-value="data.role"
                            :options="roleOptions"
                            option-label="label"
                            option-value="value"
                            :disabled="data.id === currentUserId"
                            :aria-label="t('iam.users.role-of', { name: data.fullName })"
                            size="small"
                            @update:model-value="role => changeRole(data, role)"/>
                    </template>
                </pv-column>
                <pv-column field="status" :header="t('iam.users.status')">
                    <template #body="{ data }">
                        <span class="users__status" :class="`users__status--${data.status}`">{{ t(`iam.statuses.${data.status}`) }}</span>
                    </template>
                </pv-column>
                <pv-column :header="t('iam.users.actions')">
                    <template #body="{ data }">
                        <pv-button icon="pi pi-pencil" text rounded :aria-label="t('iam.users.edit', { name: data.fullName })" @click="openDialog(data)"/>
                    </template>
                </pv-column>
            </pv-data-table>
        </div>
        <user-form-dialog
            v-model:visible="isDialogVisible"
            :user="selectedUser"
            :is-saving="store.isSaving"
            :server-error="formError"
            @submit="saveUser"/>
    </section>
</template>

<style scoped>
.users__header {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    gap: var(--space-4);
}

.users__table {
    padding: 0;
    overflow: hidden;
}

.users__you {
    margin-left: var(--space-2);
    padding: 0 var(--space-2);
    border-radius: var(--radius-full);
    background: var(--primary-soft);
    color: var(--primary-dark);
    font-size: var(--text-xs);
    font-weight: var(--weight-semibold);
}

.users__status {
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-full);
    font-size: var(--text-xs);
    font-weight: var(--weight-semibold);
}

.users__status--active {
    background: var(--success-soft);
    color: var(--success-strong);
}

.users__status--inactive {
    background: var(--fill-10);
    color: var(--foreground);
}
</style>
