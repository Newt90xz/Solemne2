<script setup lang="ts">
import Escenario from './components/scenario.vue';

</script>

<template>
  <Escenario></Escenario>
</template>

<style>
html, body, #app {
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
  height: 100% !important;
  overflow: hidden !important;
}

body {
  min-height: 100vh;
  font-family: 'Share Tech Mono', monospace;
}

*, *::before, *::after {
  box-sizing: border-box;
}
</style>
