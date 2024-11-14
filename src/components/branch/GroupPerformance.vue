<script setup lang="ts">
interface Group {
  id: string;
  name: string;
  studentCount: number;
  attendanceRate: number;
}

defineProps<{
  groups: Group[];
}>();
</script>

<template>
  <div class="mt-4 space-y-4">
    <div v-for="group in groups" :key="group.id" 
         class="bg-gray-50 rounded-lg p-4">
      <div class="flex justify-between items-center">
        <div>
          <h5 class="font-medium text-gray-900">{{ group.name }}</h5>
          <p class="text-sm text-gray-500">{{ group.studentCount }} öğrenci</p>
        </div>
        <div class="text-right">
          <div class="text-lg font-medium" 
               :class="[
                 group.attendanceRate >= 80 ? 'text-green-600' :
                 group.attendanceRate >= 60 ? 'text-yellow-600' :
                 'text-red-600'
               ]">
            {{ group.attendanceRate }}%
          </div>
          <div class="text-sm text-gray-500">katılım</div>
        </div>
      </div>
    </div>
  </div>
</template>