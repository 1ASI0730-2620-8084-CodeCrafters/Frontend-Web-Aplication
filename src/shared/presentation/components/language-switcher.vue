<script setup>
import { useI18n } from 'vue-i18n';
import { setLanguage, SUPPORTED_LANGUAGES } from '../../../i18n.js';

const { t, locale } = useI18n();
</script>

<template>
    <pv-select-button
        :model-value="locale"
        :options="SUPPORTED_LANGUAGES"
        :allow-empty="false"
        :aria-label="t('shell.language')"
        size="small"
        @update:model-value="setLanguage">
        <template #option="{ option }">
            <span>{{ option.toUpperCase() }}</span>
        </template>
    </pv-select-button>
</template>
