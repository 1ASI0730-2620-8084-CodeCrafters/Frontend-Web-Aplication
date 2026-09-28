import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { IamApi } from '../infrastructure/iam-api.js';
import { SignInAssembler } from '../infrastructure/sign-in.assembler.js';
import { UserAssembler } from '../infrastructure/user.assembler.js';
import { OrganizationAssembler } from '../infrastructure/organization.assembler.js';

const SESSION_STORAGE_KEY = 'bottletrack.session';
const iamApi = new IamApi();

function readStoredSession() {
    try {
        return JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY));
    } catch {
        return null;
    }
}

const useIamStore = defineStore('iam', () => {
    const storedSession = readStoredSession();
    const currentUser = ref(storedSession ? UserAssembler.toEntityFromResource(storedSession.user) : null);
    const currentToken = ref(storedSession?.token ?? null);
    const isSigningIn = ref(false);
    const signInError = ref(null);
    const users = ref([]);
    const usersLoaded = ref(false);
    const organization = ref(null);
    const isSaving = ref(false);

    const isSignedIn = computed(() => currentUser.value !== null);
    const currentRole = computed(() => currentUser.value?.role ?? null);

    function startSession(user, token) {
        currentUser.value = user;
        currentToken.value = token;
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ user: UserAssembler.toResourceFromEntity(user), token }));
    }

    async function signIn(signInCommand) {
        isSigningIn.value = true;
        signInError.value = null;
        try {
            const response = await iamApi.signIn(signInCommand);
            const signInResource = SignInAssembler.toResourceFromResponse(response);
            const user = signInResource ? UserAssembler.toEntityFromResource(signInResource.user) : null;
            if (!user) {
                signInError.value = 'invalid-credentials';
                return false;
            }
            if (!user.isActive) {
                signInError.value = 'inactive-user';
                return false;
            }
            startSession(user, signInResource.token);
            return true;
        } catch {
            signInError.value = 'service-unavailable';
            return false;
        } finally {
            isSigningIn.value = false;
        }
    }

    function signOut() {
        currentUser.value = null;
        currentToken.value = null;
        signInError.value = null;
        users.value = [];
        usersLoaded.value = false;
        organization.value = null;
        localStorage.removeItem(SESSION_STORAGE_KEY);
    }

    async function isEmailTaken(email, exceptUserId = null) {
        const response = await iamApi.getUsersByEmail(email);
        return response.data.some(resource => resource.id !== exceptUserId);
    }

    function replaceUser(updatedUser) {
        users.value = users.value.map(user => (user.id === updatedUser.id ? updatedUser : user));
        if (currentUser.value?.id === updatedUser.id) startSession(updatedUser, currentToken.value);
    }

    async function runSaving(operation) {
        isSaving.value = true;
        try {
            return await operation();
        } catch {
            return 'request-failed';
        } finally {
            isSaving.value = false;
        }
    }

    async function fetchUsers() {
        const response = await iamApi.getUsersByOrganization(currentUser.value.organizationId);
        users.value = UserAssembler.toEntitiesFromResponse(response);
        usersLoaded.value = true;
    }

    function registerUser(command) {
        return runSaving(async () => {
            if (await isEmailTaken(command.email)) return 'email-taken';
            const response = await iamApi.createUser(UserAssembler.toResourceFromRegisterCommand(command));
            users.value = [...users.value, UserAssembler.toEntityFromResource(response.data)];
            return null;
        });
    }

    function updateUser(command) {
        return runSaving(async () => {
            if (await isEmailTaken(command.email, command.userId)) return 'email-taken';
            const response = await iamApi.updateUser(command.userId, UserAssembler.toResourceFromUpdateCommand(command));
            replaceUser(UserAssembler.toEntityFromResource(response.data));
            return null;
        });
    }

    function assignRole(command) {
        return runSaving(async () => {
            const response = await iamApi.updateUser(command.userId, { role: command.role });
            replaceUser(UserAssembler.toEntityFromResource(response.data));
            return null;
        });
    }

    async function fetchOrganization() {
        const response = await iamApi.getOrganizationById(currentUser.value.organizationId);
        organization.value = OrganizationAssembler.toEntityFromResource(response.data);
    }

    function updateOrganization(command) {
        return runSaving(async () => {
            const response = await iamApi.updateOrganization(command.organizationId, OrganizationAssembler.toResourceFromUpdateCommand(command));
            organization.value = OrganizationAssembler.toEntityFromResource(response.data);
            return null;
        });
    }

    function canAccess(roles = []) {
        return isSignedIn.value && currentUser.value.hasAnyRole(roles);
    }

    return {
        currentUser,
        currentToken,
        currentRole,
        isSignedIn,
        isSigningIn,
        signInError,
        users,
        usersLoaded,
        organization,
        isSaving,
        signIn,
        signOut,
        canAccess,
        fetchUsers,
        registerUser,
        updateUser,
        assignRole,
        fetchOrganization,
        updateOrganization
    };
});

export default useIamStore;
