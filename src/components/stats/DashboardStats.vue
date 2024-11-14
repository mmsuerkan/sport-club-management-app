<script setup lang="ts">
defineProps<{
  totalGroups: number;
  averageAttendance: number;
  totalStudents: number;
}>();
</script>

<template>
  <div class="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
    <div class="bg-white overflow-hidden shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <dt class="text-sm font-medium text-gray-500 truncate">Toplam Grup</dt>
        <dd class="mt-1 text-3xl font-semibold text-gray-900">{{ totalGroups }}</dd>
      </div>
    </div>
    <div class="bg-white overflow-hidden shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <dt class="text-sm font-medium text-gray-500 truncate">Ortalama Katılım Oranı</dt>
        <dd class="mt-1 text-3xl font-semibold text-gray-900">{{ averageAttendance }}%</dd>
      </div>
    </div>
    <div class="bg-white overflow-hidden shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <dt class="text-sm font-medium text-gray-500 truncate">Aktif Öğrenci</dt>
        <dd class="mt-1 text-3xl font-semibold text-gray-900">{{ totalStudents }}</dd>
      </div>
    </div>
  </div>
</template>