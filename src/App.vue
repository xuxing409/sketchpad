<script setup lang="ts">
import Board from "./components/Board.vue";
import CanvaBoard from "./components/CanvaBoard.vue";
</script>

<template>
  <main>
    <!-- <Board msg="常见的几何边界计算" /> -->
    <CanvaBoard />
  </main>
</template>

<style scoped>
main {
  min-height: 100vh;
}
</style>
