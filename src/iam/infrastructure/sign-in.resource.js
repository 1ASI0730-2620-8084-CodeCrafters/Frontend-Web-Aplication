export class SignInResource {
    constructor({ user, token = null }) {
        this.user = user;
        this.token = token;
    }
}
