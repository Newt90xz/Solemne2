<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import Mainmenu from "./mainmenu.vue";
import Instrucciones from "./Instrucciones.vue";
import { ref } from 'vue';

const currentView = ref<'menu' | 'instructions'>('menu');

const handleOpenInstructions = () => {
    currentView.value = 'instructions';
};

const handleBackToMenu = () => {
    currentView.value = 'menu';
};


</script>
<template>
        <Mainmenu
            v-if="currentView === 'menu'"
            @open-instructions="handleOpenInstructions"
        />
        <Instrucciones
            v-else-if="currentView === 'instructions'"
            @go-back="handleBackToMenu"
        />
</template>