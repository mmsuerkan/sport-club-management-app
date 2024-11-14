<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '../firebase';
import { ref as dbRef, onValue, remove, update } from 'firebase/database';

interface Record {
  id: string;
  name: string;
  email: string;
  createdAt: number;
}

const records = ref<Record[]>([]);
const loading = ref(true);
const error = ref('');
const editingRecord = ref<Record | null>(null);

onMounted(() => {
  const recordsRef = dbRef(db, 'records');
  onValue(recordsRef, (snapshot) => {
    loading.value = false;
    if (snapshot.exists()) {
      const data = snapshot.val();
      records.value = Object.entries(data).map(([id, record]) => ({
        id,
        ...(record as Omit<Record, 'id'>)
      }));
    } else {
      records.value = [];
    }
  }, (err) => {
    loading.value = false;
    error.value = 'Failed to load records';
    console.error(err);
  });
});

const deleteRecord = async (id: string) => {
  try {
    await remove(dbRef(db, `records/${id}`));
  } catch (e) {
    console.error('Failed to delete record:', e);
  }
};

const startEdit = (record: Record) => {
  editingRecord.value = { ...record };
};

const saveEdit = async () => {
  if (!editingRecord.value) return;
  
  try {
    await update(dbRef(db, `records/${editingRecord.value.id}`), {
      name: editingRecord.value.name,
      email: editingRecord.value.email
    });
    editingRecord.value = null;
  } catch (e) {
    console.error('Failed to update record:', e);
  }
};
</script>

<template>
  <div class="bg-white shadow rounded-lg p-6 mt-6">
    <h2 class="text-xl font-semibold mb-4">Records</h2>
    
    <div v-if="loading" class="text-center py-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
    </div>
    
    <div v-else-if="error" class="text-red-500 text-center py-4">
      {{ error }}
    </div>
    
    <div v-else-if="records.length === 0" class="text-center py-4 text-gray-500">
      No records found
    </div>
    
    <div v-else class="space-y-4">
      <div v-for="record in records" :key="record.id" class="border rounded-lg p-4">
        <div v-if="editingRecord?.id === record.id">
          <input
            v-model="editingRecord.name"
            class="block w-full mb-2 px-3 py-2 border rounded"
          />
          <input
            v-model="editingRecord.email"
            class="block w-full mb-2 px-3 py-2 border rounded"
          />
          <div class="flex justify-end space-x-2">
            <button
              @click="saveEdit"
              class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
            >
              Save
            </button>
            <button
              @click="editingRecord = null"
              class="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
        <div v-else>
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-medium">{{ record.name }}</h3>
              <p class="text-gray-600">{{ record.email }}</p>
              <p class="text-sm text-gray-400">
                {{ new Date(record.createdAt).toLocaleString() }}
              </p>
            </div>
            <div class="space-x-2">
              <button
                @click="startEdit(record)"
                class="text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>
              <button
                @click="deleteRecord(record.id)"
                class="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>