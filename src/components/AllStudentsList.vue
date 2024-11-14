<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '../firebase';
import { ref as dbRef, onValue } from 'firebase/database';

interface Student {
  id: string;
  name: string;
  branchId: string;
  branchName: string;
  groupId: string;
  groupName: string;
  createdAt: number;
}

const students = ref<Student[]>([]);
const loading = ref(true);
const error = ref('');

onMounted(() => {
  const branchesRef = dbRef(db, 'branches');
  onValue(branchesRef, (snapshot) => {
    loading.value = false;
    if (snapshot.exists()) {
      const branches = snapshot.val();
      const allStudents: Student[] = [];
      
      Object.entries(branches).forEach(([branchId, branchData]: [string, any]) => {
        if (branchData.groups) {
          Object.entries(branchData.groups).forEach(([groupId, groupData]: [string, any]) => {
            if (groupData.students) {
              Object.entries(groupData.students).forEach(([studentId, student]: [string, any]) => {
                allStudents.push({
                  id: studentId,
                  branchId,
                  branchName: branchData.name,
                  groupId,
                  groupName: groupData.name,
                  ...(student as Omit<Student, 'id' | 'branchId' | 'branchName' | 'groupId' | 'groupName'>)
                });
              });
            }
          });
        }
      });
      
      students.value = allStudents.sort((a, b) => b.createdAt - a.createdAt);
    } else {
      students.value = [];
    }
  }, (err) => {
    loading.value = false;
    error.value = 'Failed to load students';
    console.error(err);
  });
});
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <div class="py-10">
      <header>
        <div class="mx-auto px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-bold leading-tight text-gray-900">
            All Students
          </h1>
          <p class="mt-1 text-sm text-gray-500">View all students across branches and groups</p>
        </div>
      </header>

      <main>
        <div class="mx-auto sm:px-6 lg:px-8">
          <div class="px-4 py-8 sm:px-0">
            <div class="bg-white shadow rounded-lg p-6">
              <div v-if="loading" class="text-center py-4">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              </div>
              
              <div v-else-if="error" class="text-red-500 text-center py-4">
                {{ error }}
              </div>
              
              <div v-else-if="students.length === 0" class="text-center py-4 text-gray-500">
                No students found
              </div>
              
              <div v-else class="space-y-4">
                <div v-for="student in students" :key="student.id" class="border rounded-lg p-4">
                  <div class="flex justify-between items-start">
                    <div>
                      <h3 class="font-medium">{{ student.name }}</h3>
                      <p class="text-sm text-gray-600">Branch: {{ student.branchName }}</p>
                      <p class="text-sm text-gray-600">Group: {{ student.groupName }}</p>
                      <p class="text-sm text-gray-400">
                        {{ new Date(student.createdAt).toLocaleString() }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>