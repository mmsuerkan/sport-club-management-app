<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '../firebase';
import { ref as dbRef, onValue, remove, update } from 'firebase/database';
import { PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline';

interface Branch {
  id: string;
  name: string;
  createdAt: number;
}

const branches = ref<Branch[]>([]);
const loading = ref(true);
const error = ref('');
const editingBranch = ref<Branch | null>(null);

const emit = defineEmits(['selectBranch']);

onMounted(() => {
  const branchesRef = dbRef(db, 'branches');
  onValue(branchesRef, (snapshot) => {
    loading.value = false;
    if (snapshot.exists()) {
      const data = snapshot.val();
      branches.value = Object.entries(data).map(([id, branch]) => ({
        id,
        ...(branch as Omit<Branch, 'id'>)
      }));
    } else {
      branches.value = [];
    }
  }, (err) => {
    loading.value = false;
    error.value = 'Şubeler yüklenirken bir hata oluştu';
    console.error(err);
  });
});

const deleteBranch = async (id: string) => {
  try {
    await remove(dbRef(db, `branches/${id}`));
  } catch (e) {
    console.error('Şube silinirken bir hata oluştu:', e);
  }
};

const startEdit = (branch: Branch) => {
  editingBranch.value = { ...branch };
};

const saveEdit = async () => {
  if (!editingBranch.value) return;
  
  try {
    await update(dbRef(db, `branches/${editingBranch.value.id}`), {
      name: editingBranch.value.name
    });
    editingBranch.value = null;
  } catch (e) {
    console.error('Şube güncellenirken bir hata oluştu:', e);
  }
};

const selectBranch = (branch: Branch) => {
  emit('selectBranch', branch);
};
</script>

<template>
  <div class="bg-white shadow rounded-lg p-6 mt-6">
    <h2 class="text-xl font-semibold mb-4">Şubeler</h2>
    
    <div v-if="loading" class="text-center py-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
    </div>
    
    <div v-else-if="error" class="text-red-500 text-center py-4">
      {{ error }}
    </div>
    
    <div v-else-if="branches.length === 0" class="text-center py-4 text-gray-500">
      Henüz şube bulunmamaktadır
    </div>
    
    <div v-else class="space-y-4">
      <div v-for="branch in branches" :key="branch.id" 
           class="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
           @click="selectBranch(branch)">
        <div v-if="editingBranch?.id === branch.id" @click.stop>
          <input
            v-model="editingBranch.name"
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
              @click="editingBranch = null"
              class="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
            >
              İptal
            </button>
          </div>
        </div>
        <div v-else>
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-medium">{{ branch.name }}</h3>
              <p class="text-sm text-gray-400">
                {{ new Date(branch.createdAt).toLocaleDateString('tr-TR') }}
              </p>
            </div>
            <div class="space-x-2" @click.stop>
              <button
                @click="startEdit(branch)"
                class="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 transition-colors"
                title="Düzenle"
              >
                <PencilSquareIcon class="h-5 w-5" />
              </button>
              <button
                @click="deleteBranch(branch.id)"
                class="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100 transition-colors"
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
</template>