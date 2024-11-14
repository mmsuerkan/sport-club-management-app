<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { db } from '../../firebase';
import { ref as dbRef, onValue } from 'firebase/database';
import { useTranslation } from '../../composables/useTranslation';

const { t } = useTranslation();

interface Student {
  id: string;
  name: string;
  branchId: string;
  branchName: string;
  groupId: string;
  groupName: string;
}

const emit = defineEmits(['select']);

const students = ref<Student[]>([]);
const loading = ref(true);
const error = ref('');
const searchQuery = ref('');
const selectedStudent = ref<Student | null>(null);

onMounted(() => {
  loadStudents();
});

const loadStudents = async () => {
  const branchesRef = dbRef(db, 'branches');
  onValue(branchesRef, (snapshot) => {
    loading.value = true;
    try {
      if (!snapshot.exists()) {
        students.value = [];
        return;
      }

      const branches = snapshot.val();
      const allStudents: Student[] = [];

      Object.entries(branches).forEach(([branchId, branchData]: [string, any]) => {
        if (branchData.groups) {
          Object.entries(branchData.groups).forEach(([groupId, groupData]: [string, any]) => {
            if (groupData.students) {
              Object.entries(groupData.students).forEach(([studentId, student]: [string, any]) => {
                allStudents.push({
                  id: studentId,
                  name: student.name,
                  branchId,
                  branchName: branchData.name,
                  groupId,
                  groupName: groupData.name
                });
              });
            }
          });
        }
      });

      students.value = allStudents.sort((a, b) => a.name.localeCompare(b.name));
    } catch (err) {
      console.error('Error loading students:', err);
      error.value = t('errors.loadingStudents');
    } finally {
      loading.value = false;
    }
  });
};

const filteredStudents = computed(() => {
  if (!searchQuery.value) return [];
  
  const query = searchQuery.value.toLowerCase();
  return students.value.filter(student => 
    student.name.toLowerCase().includes(query) ||
    student.branchName.toLowerCase().includes(query) ||
    student.groupName.toLowerCase().includes(query)
  );
});

const selectStudent = (student: Student) => {
  selectedStudent.value = student;
  searchQuery.value = student.name;
  emit('select', student);
};

const showResults = computed(() => {
  return searchQuery.value.length > 0 && searchQuery.value !== selectedStudent.value?.name;
});

const clearSelection = () => {
  selectedStudent.value = null;
  searchQuery.value = '';
  emit('select', null);
};
</script>

<template>
  <div class="relative z-50">
    <!-- Search Input -->
    <div class="relative">
      <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
        </svg>
      </div>
      <input
        type="text"
        v-model="searchQuery"
        :placeholder="t('common.searchStudents')"
        class="block w-full rounded-lg border border-gray-300 bg-white pl-10 pr-12 py-3 text-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      <button
        v-if="selectedStudent"
        @click="clearSelection"
        class="absolute inset-y-0 right-0 flex items-center pr-3 hover:text-gray-600"
        title="Clear selection"
      >
        <svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>

    <!-- Selected Student Card -->
    <div v-if="selectedStudent" class="mt-3">
      <div class="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 p-1 shadow-lg">
        <div class="rounded-lg bg-white px-4 py-3">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-medium text-gray-900">
                {{ selectedStudent.name }}
              </h3>
              <div class="mt-1 text-sm text-gray-500">
                {{ selectedStudent.branchName }} · {{ selectedStudent.groupName }}
              </div>
            </div>
            <div class="ml-4 flex-shrink-0">
              <div class="inline-flex items-center rounded-full bg-indigo-100 px-3 py-0.5 text-sm font-medium text-indigo-800">
                Seçildi
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Search Results Dropdown -->
    <div
      v-if="showResults"
      class="absolute mt-1 w-full rounded-md bg-white shadow-lg"
    >
      <div v-if="loading" class="px-4 py-6 text-center">
        <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-500 border-r-transparent align-[-0.125em]"></div>
        <div class="mt-2 text-sm text-gray-500">Öğrenciler yükleniyor...</div>
      </div>

      <div v-else-if="error" class="p-4 text-center">
        <div class="text-sm text-red-600">{{ error }}</div>
      </div>

      <div v-else-if="filteredStudents.length === 0" class="p-4 text-center">
        <div class="text-sm text-gray-500">{{ t('common.noStudentsFound') }}</div>
      </div>

      <ul
        v-else
        class="max-h-60 overflow-auto py-1"
        role="listbox"
      >
        <li
          v-for="student in filteredStudents"
          :key="student.id"
          class="relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-indigo-50"
          :class="{'bg-indigo-50': selectedStudent?.id === student.id}"
          @click="selectStudent(student)"
          role="option"
        >
          <div class="flex items-center">
            <span class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500">
              <span class="text-lg font-medium leading-none text-white">
                {{ student.name.charAt(0) }}
              </span>
            </span>
            <div class="ml-4 flex flex-col">
              <span class="font-medium text-gray-900">{{ student.name }}</span>
              <span class="text-sm text-gray-500">
                {{ student.branchName }} · {{ student.groupName }}
              </span>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.max-h-60 {
  max-height: 15rem;
}
</style>