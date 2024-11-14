<script setup lang="ts">
interface Student {
  id: string;
  name: string;
}

interface Attendance {
  [key: string]: boolean;
}

defineProps<{
  students: Student[];
  attendance: Attendance;
}>();

const emit = defineEmits(['toggleAttendance']);
</script>

<template>
  <div class="space-y-4">
    <div v-for="student in students" :key="student.id" 
         class="flex items-center justify-between p-4 border rounded-lg">
      <span class="font-medium">{{ student.name }}</span>
      <button
        @click="$emit('toggleAttendance', student.id)"
        :class="[
          'px-4 py-2 rounded-md text-sm font-medium',
          attendance[student.id]
            ? 'bg-green-100 text-green-800 hover:bg-green-200'
            : 'bg-red-100 text-red-800 hover:bg-red-200'
        ]"
      >
        {{ attendance[student.id] ? 'Present' : 'Absent' }}
      </button>
    </div>
  </div>
</template>