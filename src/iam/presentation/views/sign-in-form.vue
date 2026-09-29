<script setup>
import { computed, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import useIamStore from '../../application/iam.store.js';
import { SignInCommand } from '../../domain/model/sign-in.command.js';
import BrandLogo from '../../../shared/presentation/components/brand-logo.vue';
import LanguageSwitcher from '../../../shared/presentation/components/language-switcher.vue';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TERMS_OF_SERVICE_URL = 'https://1asi0730-2620-8084-codecrafters.github.io/Landing-Page/terms-of-service.html';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const store = useIamStore();

const form = reactive({ email: '', password: '' });
const wasSubmitted = ref(false);

const emailError = computed(() => {
    if (!form.email.trim()) return 'iam.sign-in.email-required';
    return EMAIL_PATTERN.test(form.email.trim()) ? null : 'iam.sign-in.email-invalid';
});
const passwordError = computed(() => (form.password ? null : 'iam.sign-in.password-required'));
const showEmailError = computed(() => wasSubmitted.value && emailError.value !== null);
const showPasswordError = computed(() => wasSubmitted.value && passwordError.value !== null);

function resolveRedirect() {
    const { redirect } = route.query;
    return typeof redirect === 'string' && redirect.startsWith('/') ? redirect : { name: 'home' };
}

async function performSignIn() {
    wasSubmitted.value = true;
    if (emailError.value || passwordError.value) return;
    const isSignedIn = await store.signIn(new SignInCommand(form));
    if (isSignedIn) router.replace(resolveRedirect());
}
</script>

<template>
    <div class="sign-in">
        <section class="sign-in__showcase" aria-hidden="true">
            <brand-logo/>
            <div class="sign-in__showcase-body">
                <i class="pi pi-truck sign-in__showcase-icon"></i>
                <p class="sign-in__showcase-title">{{ t('app.tagline') }}</p>
                <p class="sign-in__showcase-lead">{{ t('iam.sign-in.showcase') }}</p>
            </div>
        </section>
        <main class="sign-in__panel">
            <div class="sign-in__card">
                <div class="sign-in__header">
                    <brand-logo/>
                    <language-switcher/>
                </div>
                <div>
                    <h1 class="sign-in__title">{{ t('iam.sign-in.title') }}</h1>
                    <p class="sign-in__lead">{{ t('iam.sign-in.lead') }}</p>
                </div>
                <pv-message v-if="store.signInError" severity="error" role="alert">
                    {{ t(`iam.sign-in.errors.${store.signInError}`) }}
                </pv-message>
                <form class="sign-in__form" novalidate @submit.prevent="performSignIn">
                    <div class="sign-in__field">
                        <label for="sign-in-email">{{ t('iam.sign-in.email') }}</label>
                        <pv-input-text
                            id="sign-in-email"
                            v-model="form.email"
                            type="email"
                            autocomplete="email"
                            :placeholder="t('iam.sign-in.email-placeholder')"
                            :invalid="showEmailError"
                            :aria-invalid="showEmailError"
                            :aria-describedby="showEmailError ? 'sign-in-email-error' : undefined"
                            fluid/>
                        <small v-if="showEmailError" id="sign-in-email-error" class="sign-in__error">{{ t(emailError) }}</small>
                    </div>
                    <div class="sign-in__field">
                        <label for="sign-in-password">{{ t('iam.sign-in.password') }}</label>
                        <pv-password
                            v-model="form.password"
                            input-id="sign-in-password"
                            :feedback="false"
                            :invalid="showPasswordError"
                            :input-props="{
                                autocomplete: 'current-password',
                                'aria-invalid': showPasswordError,
                                'aria-describedby': showPasswordError ? 'sign-in-password-error' : undefined
                            }"
                            toggle-mask
                            fluid/>
                        <small v-if="showPasswordError" id="sign-in-password-error" class="sign-in__error">{{ t(passwordError) }}</small>
                    </div>
                    <pv-button type="submit" :label="t('iam.sign-in.submit')" :loading="store.isSigningIn" fluid/>
                </form>
                <p class="sign-in__footer">
                    &copy; BottleTrack &middot; CodeCrafters &middot;
                    <a :href="TERMS_OF_SERVICE_URL" target="_blank" rel="noopener noreferrer">{{ t('iam.sign-in.terms') }}</a>
                </p>
            </div>
        </main>
    </div>
</template>

<style scoped>
.sign-in {
    display: grid;
    grid-template-columns: 3fr 2fr;
    min-height: 100vh;
    background: var(--surface);
}

.sign-in__showcase {
    display: flex;
    flex-direction: column;
    padding: var(--space-8);
    background: var(--surface-muted);
}

.sign-in__showcase-body {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-3);
    text-align: center;
}

.sign-in__showcase-icon {
    color: var(--primary-mid);
    font-size: 6rem;
}

.sign-in__showcase-title {
    margin: 0;
    color: var(--primary-dark);
    font-size: var(--text-xl);
    font-weight: var(--weight-bold);
}

.sign-in__showcase-lead {
    max-width: 24rem;
    margin: 0;
    color: var(--ink-70);
    font-size: var(--text-sm);
}

.sign-in__panel {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-8) var(--space-6);
}

.sign-in__card {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    width: 100%;
    max-width: 24rem;
}

.sign-in__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.sign-in__title {
    font-size: var(--text-2xl);
}

.sign-in__lead {
    margin: var(--space-1) 0 0;
    color: var(--ink-70);
    font-size: var(--text-sm);
}

.sign-in__form {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
}

.sign-in__field {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
}

.sign-in__field label {
    font-size: var(--text-sm);
    font-weight: var(--weight-semibold);
}

.sign-in__error {
    color: var(--danger-strong);
}

.sign-in__footer {
    margin: 0;
    color: var(--ink-60);
    font-size: var(--text-xs);
    text-align: center;
}

.sign-in__footer a {
    color: var(--primary-mid);
}

@media (max-width: 48rem) {
    .sign-in {
        grid-template-columns: 1fr;
    }

    .sign-in__showcase {
        display: none;
    }
}
</style>
