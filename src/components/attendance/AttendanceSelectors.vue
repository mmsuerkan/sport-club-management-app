<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  branches: Array<{ id: string; name: string }>;
  groups: Array<{ id: string; name: string; timeSlot: string }>;
  selectedBranch: string;
  selectedGroup: string;
  selectedDate: string;
  selectedTime: string;
  isWeekend: boolean;
}>();

const emit = defineEmits(['branchChange', 'groupChange', 'dateChange', 'timeChange']);
</script>

<template>
  <div class="grid grid-cols-1 gap-6 sm:grid-cols-4 mb-6">
    <div>
      <label class="block text-sm font-medium text-gray-700">Branch</label>
      <select
        :value="selectedBranch"
        @change="$emit('branchChange', $event.target.value)"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      >
        <option value="">Select Branch</option>
        <option v-for="branch in branches" :key="branch.id" :value="branch.id">
          {{ branch.name }}
        </option>
      </select>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">Group</label>
      <select
        :value="selectedGroup"
        @change="$emit('groupChange', $event.target.value)"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        :disabled="!selectedBranch"
      >
        <option value="">Select Group</option>
        <option v-for="group in groups" :key="group.id" :value="group.id">
          {{ group.name }}
        </option>
      </select>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">Date</label>
      <input
        type="date"
        :value="selectedDate"
        @change="$emit('dateChange', $event.target.value)"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">Time Slot</label>
      <input
        type="text"
        :value="selectedTime"
        @change="$emit('timeChange', $event.target.value)"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50"
        readonly
        :placeholder="groups.find(g => g.id === selectedGroup)?.timeSlot || 'Select a group first'"
      />
    </div>
  </div>

  <div v-if="isWeekend" class="mb-4 p-4 bg-yellow-50 rounded-md">
    <p class="text-yellow-700">
      Note: The selected date is a weekend.
    </p>
  </div>
</template>