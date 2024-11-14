<script setup lang="ts">
defineProps<{
  branch: {
    name: string;
    totalGroups: number;
    totalStudents: number;
    attendanceRate: number;
  };
}>();
</script>

<template>
  <div class="flex justify-between items-start mb-4">
    <div>
      <h4 class="text-lg font-medium text-gray-900">{{ branch.name }}</h4>
      <div class="mt-1 text-sm text-gray-500">
        {{ branch.totalGroups }} grup · {{ branch.totalStudents }} öğrenci
      </div>
    </div>
    <div class="text-right">
      <div class="text-2xl font-semibold text-gray-900">
        {{ branch.attendanceRate }}%
      </div>
      <div class="text-sm text-gray-500">katılım oranı</div>
    </div>
  </div>
</template>