import { SignInResource } from './sign-in.resource.js';

export class SignInAssembler {
    static toResourceFromResponse(response) {
        if (response.status !== 200) return null;
        const resources = Array.isArray(response.data) ? response.data : [response.data];
        if (resources.length !== 1) return null;
        const [resource] = resources;
        return new SignInResource({ user: resource, token: resource.token });
    }
}
