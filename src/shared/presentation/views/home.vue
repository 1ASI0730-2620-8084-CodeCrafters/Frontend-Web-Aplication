<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
    <section class="page" aria-labelledby="home-title">
        <h1 id="home-title" class="page__title">{{ t('home.title') }}</h1>
        <p class="page__lead">{{ t('home.lead') }}</p>
    </section>
</template>
