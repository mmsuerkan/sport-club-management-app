<script setup lang="ts">
interface BreadcrumbItem {
  name: string;
  onClick?: () => void;
  current: boolean;
}

defineProps<{
  items: BreadcrumbItem[];
}>();
</script>

<template>
  <nav class="flex mb-4" aria-label="Breadcrumb">
    <ol role="list" class="flex items-center space-x-4">
      <li v-for="(item, index) in items" :key="index">
        <div class="flex items-center">
          <span
            v-if="index > 0"
            class="mx-4 text-gray-400"
            aria-hidden="true"
          >/</span>
          <button
            v-if="item.onClick"
            @click="item.onClick"
            :class="[
              item.current ? 'text-gray-700' : 'text-gray-500 hover:text-gray-700',
              'text-sm font-medium'
            ]"
            type="button"
          >
            {{ item.name }}
          </button>
          <span
            v-else
            :class="[
              item.current ? 'text-gray-700' : 'text-gray-500',
              'text-sm font-medium'
            ]"
          >
            {{ item.name }}
          </span>
        </div>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
button {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}
</style>