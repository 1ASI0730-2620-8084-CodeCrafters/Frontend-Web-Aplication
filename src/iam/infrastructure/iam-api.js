import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

const usersEndpointPath = import.meta.env.VITE_USERS_ENDPOINT_PATH;
const organizationsEndpointPath = import.meta.env.VITE_ORGANIZATIONS_ENDPOINT_PATH;

export class IamApi extends BaseApi {
    #usersEndpoint;
    #organizationsEndpoint;

    constructor() {
        super();
        this.#usersEndpoint = new BaseEndpoint(this, usersEndpointPath);
        this.#organizationsEndpoint = new BaseEndpoint(this, organizationsEndpointPath);
    }

    signIn(signInCommand) {
        return this.#usersEndpoint.getAll({ email: signInCommand.email, password: signInCommand.password });
    }

    getUsersByOrganization(organizationId) {
        return this.#usersEndpoint.getAll({ organizationId });
    }

    getUsersByEmail(email) {
        return this.#usersEndpoint.getAll({ email });
    }

    createUser(userResource) {
        return this.#usersEndpoint.create(userResource);
    }

    updateUser(userId, userResource) {
        return this.#usersEndpoint.partialUpdate(userId, userResource);
    }

    getOrganizationById(organizationId) {
        return this.#organizationsEndpoint.getById(organizationId);
    }

    updateOrganization(organizationId, organizationResource) {
        return this.#organizationsEndpoint.partialUpdate(organizationId, organizationResource);
    }
}
