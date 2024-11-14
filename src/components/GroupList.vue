<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '../firebase';
import { ref as dbRef, onValue, remove, update } from 'firebase/database';
import AddGroupModal from './AddGroupModal.vue';
import StudentList from './StudentList.vue';
import TrainerList from './TrainerList.vue';
import Breadcrumb from './Breadcrumb.vue';
import { 
  PencilSquareIcon, 
  TrashIcon,
  UserGroupIcon,
  AcademicCapIcon
} from '@heroicons/vue/24/outline';

const props = defineProps<{
  branchId: string;
  branchName: string;
}>();

const emit = defineEmits(['navigateToBranches']);

const groups = ref<Group[]>([]);
const loading = ref(true);
const error = ref('');
const editingGroup = ref<Group | null>(null);
const selectedGroup = ref<Group | null>(null);
const showTrainers = ref<Group | null>(null);
const isModalOpen = ref(false);

onMounted(() => {
  const groupsRef = dbRef(db, `branches/${props.branchId}/groups`);
  onValue(groupsRef, (snapshot) => {
    loading.value = false;
    if (snapshot.exists()) {
      const data = snapshot.val();
      groups.value = Object.entries(data).map(([id, group]) => ({
        id,
        ...(group as Omit<Group, 'id'>)
      }));
    } else {
      groups.value = [];
    }
  }, (err) => {
    loading.value = false;
    error.value = 'Gruplar yüklenirken bir hata oluştu';
    console.error(err);
  });
});

const deleteGroup = async (id: string) => {
  try {
    await remove(dbRef(db, `branches/${props.branchId}/groups/${id}`));
  } catch (e) {
    console.error('Grup silinirken bir hata oluştu:', e);
  }
};

const startEdit = (group: Group) => {
  editingGroup.value = { ...group };
};

const saveEdit = async () => {
  if (!editingGroup.value) return;
  
  try {
    await update(dbRef(db, `branches/${props.branchId}/groups/${editingGroup.value.id}`), {
      name: editingGroup.value.name,
      timeSlot: editingGroup.value.timeSlot
    });
    editingGroup.value = null;
  } catch (e) {
    console.error('Grup güncellenirken bir hata oluştu:', e);
  }
};

const selectGroup = (group: Group) => {
  selectedGroup.value = group;
};

const toggleTrainers = (group: Group) => {
  showTrainers.value = showTrainers.value?.id === group.id ? null : group;
};

const getBreadcrumbItems = () => {
  return [
    { name: 'Şubeler', onClick: () => emit('navigateToBranches'), current: false },
    { name: props.branchName, current: true }
  ];
};
</script>

<template>
  <div v-if="!selectedGroup && !showTrainers" class="min-h-screen bg-gray-100">
    <div class="py-10">
      <header>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb :items="getBreadcrumbItems()" />
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-3xl font-bold leading-tight text-gray-900">
                {{ props.branchName }}
              </h1>
              <p class="mt-1 text-sm text-gray-500">Bu şubedeki grupları yönetin</p>
            </div>
            <button
              @click="isModalOpen = true"
              class="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Yeni Grup Ekle
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
              
              <div v-else-if="groups.length === 0" class="text-center py-4 text-gray-500">
                Bu şubede henüz grup bulunmamaktadır
              </div>
              
              <div v-else class="space-y-4">
                <div v-for="group in groups" :key="group.id" 
                     class="border rounded-lg p-4 hover:bg-gray-50 transition duration-150">
                  <div v-if="editingGroup?.id === group.id" @click.stop>
                    <input
                      v-model="editingGroup.name"
                      class="block w-full mb-2 px-3 py-2 border rounded"
                    />
                    <input
                      v-model="editingGroup.timeSlot"
                      class="block w-full mb-2 px-3 py-2 border rounded"
                      placeholder="10.00-11.00"
                    />
                    <div class="flex justify-end space-x-2">
                      <button
                        @click="saveEdit"
                        class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        Kaydet
                      </button>
                      <button
                        @click="editingGroup = null"
                        class="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                  <div v-else>
                    <div class="flex justify-between items-start">
                      <div>
                        <h3 class="font-medium text-lg text-gray-900">{{ group.name }}</h3>
                        <p class="text-sm text-gray-600">Saat: {{ group.timeSlot }}</p>
                      </div>
                      <div class="flex items-center space-x-4">
                        <!-- Action Buttons -->
                        <button
                          @click="toggleTrainers(group)"
                          class="inline-flex items-center text-indigo-600 hover:text-indigo-800 px-3 py-2 rounded-md hover:bg-indigo-50 transition-colors"
                        >
                          <UserGroupIcon class="h-5 w-5 mr-2" />
                          <span>Eğitmenler</span>
                        </button>
                        <button
                          @click="selectGroup(group)"
                          class="inline-flex items-center text-indigo-600 hover:text-indigo-800 px-3 py-2 rounded-md hover:bg-indigo-50 transition-colors"
                        >
                          <AcademicCapIcon class="h-5 w-5 mr-2" />
                          <span>Öğrenciler</span>
                        </button>
                        
                        <!-- Edit/Delete Icons -->
                        <div class="flex items-center space-x-2">
                          <button
                            @click="startEdit(group)"
                            class="p-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50 transition-colors"
                            title="Düzenle"
                          >
                            <PencilSquareIcon class="h-5 w-5" />
                          </button>
                          <button
                            @click="deleteGroup(group.id)"
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
        </div>
      </main>
    </div>

    <AddGroupModal
      :is-open="isModalOpen"
      :branch-id="branchId"
      @close="isModalOpen = false"
      @group-added="isModalOpen = false"
    />
  </div>

  <StudentList
    v-else-if="selectedGroup"
    :branch-id="branchId"
    :branch-name="branchName"
    :group-id="selectedGroup.id"
    :group-name="selectedGroup.name"
    @navigate-to-branches="$emit('navigateToBranches')"
    @navigate-to-groups="selectedGroup = null"
  />

  <TrainerList
    v-else-if="showTrainers"
    :branch-id="branchId"
    :branch-name="branchName"
    :group-id="showTrainers.id"
    :group-name="showTrainers.name"
    @navigate-to-branches="$emit('navigateToBranches')"
    @navigate-to-groups="showTrainers = null"
  />
</template>