<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '../firebase';
import { ref as dbRef, onValue, remove, update } from 'firebase/database';
import AddStudentModal from './AddStudentModal.vue';
import Breadcrumb from './Breadcrumb.vue';
import { PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline';

interface Student {
  id: string;
  name: string;
  createdAt: number;
}

const props = defineProps<{
  branchId: string;
  groupId: string;
  groupName: string;
  branchName: string;
}>();

const emit = defineEmits(['navigateToBranches', 'navigateToGroups']);

const students = ref<Student[]>([]);
const loading = ref(true);
const error = ref('');
const editingStudent = ref<Student | null>(null);
const isModalOpen = ref(false);

onMounted(() => {
  const studentsRef = dbRef(db, `branches/${props.branchId}/groups/${props.groupId}/students`);
  onValue(studentsRef, (snapshot) => {
    loading.value = false;
    if (snapshot.exists()) {
      const data = snapshot.val();
      students.value = Object.entries(data).map(([id, student]) => ({
        id,
        ...(student as Omit<Student, 'id'>)
      }));
    } else {
      students.value = [];
    }
  }, (err) => {
    loading.value = false;
    error.value = 'Öğrenciler yüklenirken bir hata oluştu';
    console.error(err);
  });
});

const deleteStudent = async (id: string) => {
  try {
    await remove(dbRef(db, `branches/${props.branchId}/groups/${props.groupId}/students/${id}`));
  } catch (e) {
    console.error('Öğrenci silinirken bir hata oluştu:', e);
  }
};

const startEdit = (student: Student) => {
  editingStudent.value = { ...student };
};

const saveEdit = async () => {
  if (!editingStudent.value) return;
  
  try {
    await update(dbRef(db, `branches/${props.branchId}/groups/${props.groupId}/students/${editingStudent.value.id}`), {
      name: editingStudent.value.name
    });
    editingStudent.value = null;
  } catch (e) {
    console.error('Öğrenci güncellenirken bir hata oluştu:', e);
  }
};

const getBreadcrumbItems = () => {
  return [
    { name: 'Şubeler', onClick: () => emit('navigateToBranches'), current: false },
    { name: props.branchName, onClick: () => emit('navigateToGroups'), current: false },
    { name: props.groupName, current: true }
  ];
};
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <div class="py-10">
      <header>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb :items="getBreadcrumbItems()" />
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-3xl font-bold leading-tight text-gray-900">
                {{ groupName }}
              </h1>
              <p class="mt-1 text-sm text-gray-500">Bu gruptaki öğrencileri yönetin</p>
            </div>
            <button
              @click="isModalOpen = true"
              class="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Yeni Öğrenci Ekle
            </button>
          </div>
        </div>
      </header>

      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div class="px-4 py-8 sm:px-0">
            <div class="bg-white shadow rounded-lg p-6">
              <div v-if="loading" class="text-center py-4">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              </div>
              
              <div v-else-if="error" class="text-red-500 text-center py-4">
                {{ error }}
              </div>
              
              <div v-else-if="students.length === 0" class="text-center py-4 text-gray-500">
                Bu grupta henüz öğrenci bulunmamaktadır
              </div>
              
              <div v-else class="space-y-4">
                <div v-for="student in students" :key="student.id" class="border rounded-lg p-4 hover:bg-gray-50 transition duration-150">
                  <div v-if="editingStudent?.id === student.id">
                    <input
                      v-model="editingStudent.name"
                      class="block w-full mb-2 px-3 py-2 border rounded"
                    />
                    <div class="flex justify-end space-x-2">
                      <button
                        @click="saveEdit"
                        class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        Kaydet
                      </button>
                      <button
                        @click="editingStudent = null"
                        class="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                  <div v-else>
                    <div class="flex justify-between items-start">
                      <div>
                        <h3 class="font-medium text-lg text-gray-900">{{ student.name }}</h3>
                        <p class="text-sm text-gray-400">
                          {{ new Date(student.createdAt).toLocaleDateString('tr-TR') }}
                        </p>
                      </div>
                      <div class="flex items-center space-x-2">
                        <button
                          @click="startEdit(student)"
                          class="p-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50 transition-colors"
                          title="Düzenle"
                        >
                          <PencilSquareIcon class="h-5 w-5" />
                        </button>
                        <button
                          @click="deleteStudent(student.id)"
                          class="p-2 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50 transition-colors"
                          title="Sil"
                        >
                          <TrashIcon class="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <AddStudentModal
      :is-open="isModalOpen"
      :branch-id="branchId"
      :group-id="groupId"
      @close="isModalOpen = false"
      @student-added="isModalOpen = false"
    />
  </div>
</template>