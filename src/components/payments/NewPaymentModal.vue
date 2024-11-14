<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '../../firebase';
import { ref as dbRef, push, set, get } from 'firebase/database';
import { useTranslation } from '../../composables/useTranslation';

const { t } = useTranslation();

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits(['close', 'paymentAdded']);

const branches = ref<Array<{ id: string; name: string }>>([]);
const groups = ref<Array<{ id: string; name: string }>>([]);
const students = ref<Array<{ id: string; name: string }>>([]);

const selectedBranch = ref('');
const selectedGroup = ref('');
const selectedStudent = ref('');
const amount = ref<number>(0);
const paymentMethod = ref('cash');
const paymentStatus = ref('completed');
const reference = ref('');

const loading = ref(false);
const error = ref('');

onMounted(() => {
  loadBranches();
});

const loadBranches = async () => {
  try {
    const branchesRef = dbRef(db, 'branches');
    const snapshot = await get(branchesRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      branches.value = Object.entries(data).map(([id, branch]: [string, any]) => ({
        id,
        name: branch.name
      }));
    }
  } catch (err) {
    console.error('Error loading branches:', err);
  }
};

const loadGroups = async (branchId: string) => {
  if (!branchId) return;
  
  try {
    const groupsRef = dbRef(db, `branches/${branchId}/groups`);
    const snapshot = await get(groupsRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      groups.value = Object.entries(data).map(([id, group]: [string, any]) => ({
        id,
        name: group.name
      }));
    } else {
      groups.value = [];
    }
  } catch (err) {
    console.error('Error loading groups:', err);
  }
};

const loadStudents = async (branchId: string, groupId: string) => {
  if (!branchId || !groupId) return;
  
  try {
    const studentsRef = dbRef(db, `branches/${branchId}/groups/${groupId}/students`);
    const snapshot = await get(studentsRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      students.value = Object.entries(data).map(([id, student]: [string, any]) => ({
        id,
        name: student.name
      }));
    } else {
      students.value = [];
    }
  } catch (err) {
    console.error('Error loading students:', err);
  }
};

const handleBranchChange = (branchId: string) => {
  selectedBranch.value = branchId;
  selectedGroup.value = '';
  selectedStudent.value = '';
  students.value = [];
  loadGroups(branchId);
};

const handleGroupChange = (groupId: string) => {
  selectedGroup.value = groupId;
  selectedStudent.value = '';
  if (selectedBranch.value && groupId) {
    loadStudents(selectedBranch.value, groupId);
  }
};

const resetForm = () => {
  selectedBranch.value = '';
  selectedGroup.value = '';
  selectedStudent.value = '';
  amount.value = 0;
  paymentMethod.value = 'cash';
  paymentStatus.value = 'completed';
  reference.value = '';
  error.value = '';
};

const closeModal = () => {
  resetForm();
  emit('close');
};

const processPayment = async () => {
  if (!selectedBranch.value || !selectedGroup.value || !selectedStudent.value || !amount.value) {
    error.value = 'Lütfen tüm alanları doldurun';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    // Get branch and group data
    const [branchSnapshot, groupSnapshot, studentSnapshot] = await Promise.all([
      get(dbRef(db, `branches/${selectedBranch.value}`)),
      get(dbRef(db, `branches/${selectedBranch.value}/groups/${selectedGroup.value}`)),
      get(dbRef(db, `branches/${selectedBranch.value}/groups/${selectedGroup.value}/students/${selectedStudent.value}`))
    ]);

    if (!branchSnapshot.exists() || !groupSnapshot.exists() || !studentSnapshot.exists()) {
      throw new Error('Geçersiz şube, grup veya öğrenci seçimi');
    }

    const branchData = branchSnapshot.val();
    const groupData = groupSnapshot.val();
    const studentData = studentSnapshot.val();

    const paymentData = {
      branchId: selectedBranch.value,
      branchName: branchData.name,
      groupId: selectedGroup.value,
      groupName: groupData.name,
      studentId: selectedStudent.value,
      studentName: studentData.name,
      amount: amount.value,
      method: paymentMethod.value,
      status: paymentStatus.value,
      reference: reference.value || null,
      date: new Date().toISOString(),
      createdAt: Date.now()
    };

    const newPaymentRef = push(dbRef(db, 'payments'));
    await set(newPaymentRef, paymentData);

    resetForm();
    emit('paymentAdded');
    emit('close');
  } catch (err) {
    console.error('Error processing payment:', err);
    error.value = 'Ödeme işlenirken bir hata oluştu. Lütfen tekrar deneyin.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
  
  <div v-if="isOpen" class="fixed inset-0 z-10 overflow-y-auto">
    <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
      <div class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
        <div class="absolute right-0 top-0 pr-4 pt-4">
          <button
            type="button"
            @click="closeModal"
            class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <span class="sr-only">{{ t('common.close') }}</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="sm:flex sm:items-start">
          <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
            <h3 class="text-xl font-semibold leading-6 text-gray-900">{{ t('payments.newPayment') }}</h3>
            <div class="mt-4">
              <form @submit.prevent="processPayment" class="space-y-4">
                <!-- Branch Selection -->
                <div>
                  <label class="block text-sm font-medium text-gray-700">{{ t('common.branch') }}</label>
                  <select
                    v-model="selectedBranch"
                    @change="handleBranchChange($event.target.value)"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  >
                    <option value="">{{ t('common.selectBranch') }}</option>
                    <option v-for="branch in branches" :key="branch.id" :value="branch.id">
                      {{ branch.name }}
                    </option>
                  </select>
                </div>

                <!-- Group Selection -->
                <div>
                  <label class="block text-sm font-medium text-gray-700">{{ t('common.group') }}</label>
                  <select
                    v-model="selectedGroup"
                    @change="handleGroupChange($event.target.value)"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                    :disabled="!selectedBranch"
                  >
                    <option value="">{{ t('common.selectGroup') }}</option>
                    <option v-for="group in groups" :key="group.id" :value="group.id">
                      {{ group.name }}
                    </option>
                  </select>
                </div>

                <!-- Student Selection -->
                <div>
                  <label class="block text-sm font-medium text-gray-700">{{ t('common.student') }}</label>
                  <select
                    v-model="selectedStudent"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                    :disabled="!selectedGroup"
                  >
                    <option value="">{{ t('common.selectStudent') }}</option>
                    <option v-for="student in students" :key="student.id" :value="student.id">
                      {{ student.name }}
                    </option>
                  </select>
                </div>

                <!-- Amount -->
                <div>
                  <label class="block text-sm font-medium text-gray-700">{{ t('common.amount') }}</label>
                  <div class="relative mt-1 rounded-md shadow-sm">
                    <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span class="text-gray-500 sm:text-sm">₺</span>
                    </div>
                    <input
                      v-model="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      class="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                </div>

                <!-- Payment Method -->
                <div>
                  <label class="block text-sm font-medium text-gray-700">{{ t('common.method') }}</label>
                  <select
                    v-model="paymentMethod"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  >
                    <option value="cash">{{ t('payments.methods.cash') }}</option>
                    <option value="card">{{ t('payments.methods.card') }}</option>
                    <option value="transfer">{{ t('payments.methods.transfer') }}</option>
                  </select>
                </div>

                <!-- Payment Status -->
                <div>
                  <label class="block text-sm font-medium text-gray-700">{{ t('common.status') }}</label>
                  <select
                    v-model="paymentStatus"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  >
                    <option value="completed">{{ t('payments.status.completed') }}</option>
                    <option value="pending">{{ t('payments.status.pending') }}</option>
                  </select>
                </div>

                <!-- Reference -->
                <div>
                  <label class="block text-sm font-medium text-gray-700">{{ t('common.reference') }}</label>
                  <input
                    v-model="reference"
                    type="text"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    :placeholder="t('payments.reference')"
                  />
                </div>

                <!-- Error Message -->
                <div v-if="error" class="text-red-500 text-sm mt-2">
                  {{ error }}
                </div>

                <!-- Submit Button -->
                <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    :disabled="loading"
                    class="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {{ loading ? t('common.processing') : t('payments.processPayment') }}
                  </button>
                  <button
                    type="button"
                    @click="closeModal"
                    class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    {{ t('common.cancel') }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>