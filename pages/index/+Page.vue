<template>
  <h1 class="font-bold text-3xl pb-4">My Vike app</h1>

  This page is:
  <ul>
    <li>Rendered to HTML.</li>
    <li>Interactive. <Counter /></li>
  </ul>
</template>

<script setup>
import Counter from "../../components/Counter.vue";
import { helloworld } from "../../lib/utils.js";
helloworld()
</script>
