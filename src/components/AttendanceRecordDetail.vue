<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { db } from '../firebase';
import { ref as dbRef, get } from 'firebase/database';

interface Student {
  id: string;
  name: string;
  status: boolean;
}

const props = defineProps<{
  record: {
    branchId: string;
    groupId: string;
    date: string;
    timeSlot: string;
    branchName: string;
    groupName: string;
    attendance: Record<string, boolean>;
  }
}>();

const emit = defineEmits(['back']);

const students = ref<Student[]>([]);
const loading = ref(true);
const error = ref('');
const searchQuery = ref('');
const sortBy = ref<'name' | 'status'>('name');
const sortOrder = ref<'asc' | 'desc'>('asc');

onMounted(async () => {
  try {
    const studentsRef = dbRef(db, `branches/${props.record.branchId}/groups/${props.record.groupId}/students`);
    const snapshot = await get(studentsRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      students.value = Object.entries(data).map(([id, student]: [string, any]) => ({
        id,
        name: student.name,
        status: props.record.attendance[id] || false
      }));
    }
    loading.value = false;
  } catch (err) {
    loading.value = false;
    error.value = 'Failed to load students';
    console.error(err);
  }
});

const filteredStudents = computed(() => {
  let result = [...students.value];
  
  if (searchQuery.value) {
    result = result.filter(student => 
      student.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }
  
  result.sort((a, b) => {
    if (sortBy.value === 'name') {
      return sortOrder.value === 'asc' 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else {
      return sortOrder.value === 'asc'
        ? Number(a.status) - Number(b.status)
        : Number(b.status) - Number(a.status);
    }
  });
  
  return result;
});

const attendanceStats = computed(() => {
  const total = students.value.length;
  const present = students.value.filter(s => s.status).length;
  const percentage = total > 0 ? (present / total) * 100 : 0;
  
  return {
    total,
    present,
    absent: total - present,
    percentage: percentage.toFixed(1)
  };
});

const toggleSort = (field: 'name' | 'status') => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = field;
    sortOrder.value = 'asc';
  }
};

const exportToCSV = () => {
  const headers = ['Name', 'Status', 'Date', 'Time'];
  const rows = filteredStudents.value.map(student => [
    student.name,
    student.status ? 'Present' : 'Absent',
    new Date(props.record.date).toLocaleDateString(),
    props.record.timeSlot
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `attendance_${props.record.date}_${props.record.groupName}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>

<template>
  <div class="bg-white shadow rounded-lg p-6">
    <div class="mb-6">
      <button
        @click="$emit('back')"
        class="text-indigo-600 hover:text-indigo-800 flex items-center"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Records
      </button>
    </div>

    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900">{{ record.groupName }}</h2>
      <div class="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div class="bg-gray-50 p-3 rounded-lg">
          <p class="text-sm text-gray-500">Branch</p>
          <p class="font-medium">{{ record.branchName }}</p>
        </div>
        <div class="bg-gray-50 p-3 rounded-lg">
          <p class="text-sm text-gray-500">Date</p>
          <p class="font-medium">{{ new Date(record.date).toLocaleDateString() }}</p>
        </div>
        <div class="bg-gray-50 p-3 rounded-lg">
          <p class="text-sm text-gray-500">Time</p>
          <p class="font-medium">{{ record.timeSlot }}</p>
        </div>
        <div class="bg-gray-50 p-3 rounded-lg">
          <p class="text-sm text-gray-500">Attendance Rate</p>
          <p class="font-medium">{{ attendanceStats.percentage }}%</p>
        </div>
      </div>
    </div>

    <div class="mb-6 bg-indigo-50 p-4 rounded-lg">
      <div class="grid grid-cols-3 gap-4 text-center">
        <div>
          <p class="text-sm text-gray-500">Total Students</p>
          <p class="text-xl font-semibold text-gray-900">{{ attendanceStats.total }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">Present</p>
          <p class="text-xl font-semibold text-green-600">{{ attendanceStats.present }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">Absent</p>
          <p class="text-xl font-semibold text-red-600">{{ attendanceStats.absent }}</p>
        </div>
      </div>
    </div>

    <div class="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div class="w-full sm:w-64">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search students..."
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      <button
        @click="exportToCSV"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Export to CSV
      </button>
    </div>

    <div v-if="loading" class="text-center py-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
    </div>
    
    <div v-else-if="error" class="text-red-500 text-center py-4">
      {{ error }}
    </div>
    
    <div v-else>
      <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <table class="min-w-full divide-y divide-gray-300">
          <thead class="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                @click="toggleSort('name')"
              >
                <div class="flex items-center">
                  Name
                  <svg 
                    class="w-4 h-4 ml-1" 
                    :class="{ 'rotate-180': sortBy === 'name' && sortOrder === 'desc' }"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </th>
              <th 
                scope="col" 
                class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                @click="toggleSort('status')"
              >
                <div class="flex items-center">
                  Status
                  <svg 
                    class="w-4 h-4 ml-1" 
                    :class="{ 'rotate-180': sortBy === 'status' && sortOrder === 'desc' }"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="student in filteredStudents" :key="student.id">
              <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                {{ student.name }}
              </td>
              <td class="whitespace-nowrap px-3 py-4 text-sm">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    student.status
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ student.status ? 'Present' : 'Absent' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>