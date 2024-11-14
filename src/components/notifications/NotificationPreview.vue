<script setup lang="ts">
import { BellIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/vue/24/outline';

const props = defineProps<{
  notification: {
    title: string;
    message: string;
    type: string;
  };
}>();

const getIcon = () => {
  switch (props.notification.type) {
    case 'success':
      return CheckCircleIcon;
    case 'warning':
      return ExclamationTriangleIcon;
    case 'error':
      return ExclamationTriangleIcon;
    default:
      return InformationCircleIcon;
  }
};

const getTypeColor = () => {
  switch (props.notification.type) {
    case 'success':
      return 'text-green-500';
    case 'warning':
      return 'text-yellow-500';
    case 'error':
      return 'text-red-500';
    default:
      return 'text-blue-500';
  }
};
</script>

<template>
  <div class="mt-4">
    <h4 class="text-sm font-medium text-gray-900 mb-2">Önizleme</h4>
    <div class="bg-white border rounded-lg p-4 shadow-sm">
      <div class="flex items-start space-x-3">
        <component
          :is="getIcon()"
          :class="[getTypeColor(), 'h-6 w-6 flex-shrink-0']"
        />
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900">
            {{ notification.title }}
          </p>
          <p class="mt-1 text-sm text-gray-500">
            {{ notification.message }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>