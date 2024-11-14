<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  selectedRange: string;
  selectedMonth: Date;
}>();

const emit = defineEmits(['range-change', 'month-change']);

const ranges = [
  { value: 'month', label: 'Aylık' },
  { value: 'quarter', label: 'Çeyrek' },
  { value: 'year', label: 'Yıllık' }
];
</script>

<template>
  <div class="flex items-center space-x-4">
    <select
      :value="selectedRange"
      @change="$emit('range-change', $event.target.value)"
      class="rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
    >
      <option v-for="range in ranges" :key="range.value" :value="range.value">
        {{ range.label }}
      </option>
    </select>

    <input
      type="month"
      :value="selectedMonth.toISOString().slice(0, 7)"
      @change="$emit('month-change', new Date($event.target.value))"
      class="rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
    />
  </div>
</template>