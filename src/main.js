import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import {
    Avatar,
    Button,
    Card,
    Checkbox,
    Column,
    ConfirmationService,
    ConfirmDialog,
    DataTable,
    DatePicker,
    Dialog,
    Drawer,
    FloatLabel,
    IconField,
    InputIcon,
    InputNumber,
    InputText,
    Message,
    Password,
    Select,
    SelectButton,
    Tag,
    Textarea,
    Toast,
    ToastService,
    Toolbar
} from 'primevue';
import Tooltip from 'primevue/tooltip';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import './tokens.css';
import './style.css';
import App from './app.vue';
import BottleTrackPreset from './theme.js';
import i18n from './i18n.js';
import pinia from './pinia.js';
import router from './router.js';

const app = createApp(App)
    .use(pinia)
    .use(i18n)
    .use(PrimeVue, { theme: { preset: BottleTrackPreset, options: { darkModeSelector: false } }, ripple: true })
    .use(ConfirmationService)
    .use(ToastService)
    .component('pv-avatar', Avatar)
    .component('pv-button', Button)
    .component('pv-card', Card)
    .component('pv-checkbox', Checkbox)
    .component('pv-column', Column)
    .component('pv-confirm-dialog', ConfirmDialog)
    .component('pv-data-table', DataTable)
    .component('pv-date-picker', DatePicker)
    .component('pv-dialog', Dialog)
    .component('pv-drawer', Drawer)
    .component('pv-float-label', FloatLabel)
    .component('pv-icon-field', IconField)
    .component('pv-input-icon', InputIcon)
    .component('pv-input-number', InputNumber)
    .component('pv-input-text', InputText)
    .component('pv-message', Message)
    .component('pv-password', Password)
    .component('pv-select', Select)
    .component('pv-select-button', SelectButton)
    .component('pv-tag', Tag)
    .component('pv-textarea', Textarea)
    .component('pv-toast', Toast)
    .component('pv-toolbar', Toolbar)
    .directive('tooltip', Tooltip)
    .use(router);

router.isReady().then(() => app.mount('#app'));
