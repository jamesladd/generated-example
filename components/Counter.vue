<template>
  <button
    type="button"
    class="inline-block border border-black rounded bg-gray-200 px-2 py-1 text-xs font-medium uppercase leading-normal"
    @click="state.count++"
  >
    Counter {{ state.count }}
  </button>
</template>

<script setup lang="ts">
import { reactive } from "vue";

const state = reactive({ count: 0 });
</script>
