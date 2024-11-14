<script setup lang="ts">
import { ref } from 'vue';
import BranchList from '../BranchList.vue';
import GroupList from '../GroupList.vue';
import AddBranchModal from '../AddBranchModal.vue';

const props = defineProps<{
  selectedBranch: { id: string; name: string; } | null;
}>();

const emit = defineEmits(['selectBranch', 'resetBranch']);

const isModalOpen = ref(false);

const openModal = () => {
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};
</script>

<template>
  <div>
    <header>
      <div class="mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
          <h1 class="text-3xl font-bold leading-tight text-gray-900">
            {{ selectedBranch ? selectedBranch.name : 'Şubeler' }}
          </h1>
          <button
            v-if="!selectedBranch"
            @click="openModal"
            class="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Yeni Şube Ekle
          </button>
        </div>
      </div>
    </header>

    <main>
      <div class="mx-auto sm:px-6 lg:px-8">
        <div class="px-4 py-8 sm:px-0">
          <div v-if="!selectedBranch">
            <BranchList @select-branch="$emit('selectBranch', $event)" />
          </div>
          <GroupList
            v-else
            :branch-id="selectedBranch.id"
            :branch-name="selectedBranch.name"
            @navigate-to-branches="$emit('resetBranch')"
          />
        </div>
      </div>
    </main>

    <AddBranchModal
      :is-open="isModalOpen"
      @close="closeModal"
      @branch-added="closeModal"
    />
  </div>
</template>