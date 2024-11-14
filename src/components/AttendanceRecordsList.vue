<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '../firebase';
import { ref as dbRef, get } from 'firebase/database';
import AttendanceRecordDetail from './AttendanceRecordDetail.vue';
import { useTranslation } from '../composables/useTranslation';

const { t } = useTranslation();

interface AttendanceRecord {
  id: string;
  date: string;
  timeSlot: string;
  branchId: string;
  branchName: string;
  groupId: string;
  groupName: string;
  attendance: Record<string, boolean>;
  presentCount: number;
  totalCount: number;
}

const records = ref<AttendanceRecord[]>([]);
const loading = ref(true);
const error = ref('');
const selectedRecord = ref<AttendanceRecord | null>(null);

const loadAttendanceRecords = async () => {
  try {
    const attendanceRef = dbRef(db, 'attendance');
    const branchesRef = dbRef(db, 'branches');
    
    const [attendanceSnapshot, branchesSnapshot] = await Promise.all([
      get(attendanceRef),
      get(branchesRef)
    ]);
    
    if (!branchesSnapshot.exists()) {
      records.value = [];
      loading.value = false;
      return;
    }

    const branches = branchesSnapshot.val();
    const attendance = attendanceSnapshot.exists() ? attendanceSnapshot.val() : {};
    const allRecords: AttendanceRecord[] = [];

    for (const branchId in attendance) {
      const branchData = branches[branchId];
      if (!branchData) continue;

      for (const groupId in attendance[branchId]) {
        const groupData = branchData.groups?.[groupId];
        if (!groupData) continue;

        const studentsCount = groupData.students ? Object.keys(groupData.students).length : 0;

        for (const date in attendance[branchId][groupId]) {
          for (const timeSlot in attendance[branchId][groupId][date]) {
            const attendanceData = attendance[branchId][groupId][date][timeSlot];
            if (!attendanceData) continue;

            const presentCount = Object.values(attendanceData).filter(Boolean).length;

            allRecords.push({
              id: `${branchId}-${groupId}-${date}-${timeSlot}`,
              date,
              timeSlot: timeSlot.replace(/_/g, '.'),
              branchId,
              branchName: branchData.name,
              groupId,
              groupName: groupData.name,
              attendance: attendanceData,
              presentCount,
              totalCount: studentsCount
            });
          }
        }
      }
    }

    records.value = allRecords.sort((a, b) => {
      const dateTimeA = new Date(`${a.date} ${a.timeSlot.split('-')[0]}`).getTime();
      const dateTimeB = new Date(`${b.date} ${b.timeSlot.split('-')[0]}`).getTime();
      return dateTimeB - dateTimeA;
    });
  } catch (err) {
    console.error('Error loading attendance records:', err);
    error.value = t('errors.loadingAttendance');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadAttendanceRecords();
});

const selectRecord = (record: AttendanceRecord) => {
  selectedRecord.value = record;
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <div class="py-10">
      <header>
        <div class="mx-auto px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-bold leading-tight text-gray-900">
            {{ t('attendance.records') }}
          </h1>
          <p class="mt-1 text-sm text-gray-500">{{ t('attendance.viewRecords') }}</p>
        </div>
      </header>

      <main>
        <div class="mx-auto sm:px-6 lg:px-8">
          <div class="px-4 py-8 sm:px-0">
            <div v-if="!selectedRecord" class="bg-white shadow rounded-lg p-6">
              <div v-if="loading" class="text-center py-4">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              </div>
              
              <div v-else-if="error" class="text-red-500 text-center py-4">
                {{ error }}
              </div>
              
              <div v-else-if="records.length === 0" class="text-center py-4 text-gray-500">
                {{ t('attendance.noRecords') }}
              </div>
              
              <div v-else class="space-y-4">
                <div
                  v-for="record in records"
                  :key="record.id"
                  class="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition duration-150"
                  @click="selectRecord(record)"
                >
                  <div class="flex justify-between items-start">
                    <div>
                      <h3 class="font-medium text-lg text-gray-900">{{ record.groupName }}</h3>
                      <p class="text-sm text-gray-600">{{ t('common.branch') }}: {{ record.branchName }}</p>
                      <p class="text-sm text-gray-600">
                        {{ t('common.date') }}: {{ formatDate(record.date) }}
                      </p>
                      <p class="text-sm text-gray-600">{{ t('common.time') }}: {{ record.timeSlot }}</p>
                    </div>
                    <div class="text-right">
                      <div class="text-sm font-medium text-gray-900">
                        {{ record.presentCount }} / {{ record.totalCount }} {{ t('attendance.present') }}
                      </div>
                      <div class="text-sm text-gray-500">
                        {{ Math.round((record.presentCount / record.totalCount) * 100) }}% {{ t('attendance.rate') }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <AttendanceRecordDetail
              v-else
              :record="selectedRecord"
              @back="selectedRecord = null"
            />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>