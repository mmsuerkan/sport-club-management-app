<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { db } from '../../firebase';
import { ref as dbRef, onValue, set } from 'firebase/database';
import AttendanceSelectors from './AttendanceSelectors.vue';
import AttendanceList from './AttendanceList.vue';
import AttendanceActions from './AttendanceActions.vue';

interface Branch {
  id: string;
  name: string;
}

interface Group {
  id: string;
  name: string;
  timeSlot: string;
}

interface Student {
  id: string;
  name: string;
}

interface Attendance {
  [key: string]: boolean;
}

const branches = ref<Branch[]>([]);
const groups = ref<Group[]>([]);
const students = ref<Student[]>([]);
const selectedBranch = ref('');
const selectedGroup = ref('');
const selectedDate = ref('');
const selectedTime = ref('');
const attendance = ref<Attendance>({});
const loading = ref(false);
const error = ref('');
const saveSuccess = ref(false);

// Set default date to today
onMounted(() => {
  const today = new Date();
  selectedDate.value = today.toISOString().split('T')[0];
  loadBranches();
});

const loadBranches = () => {
  const branchesRef = dbRef(db, 'branches');
  onValue(branchesRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      branches.value = Object.entries(data).map(([id, branch]: [string, any]) => ({
        id,
        name: branch.name
      }));
    }
  });
};

const loadGroups = (branchId: string) => {
  if (!branchId) return;
  
  const groupsRef = dbRef(db, `branches/${branchId}/groups`);
  onValue(groupsRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      groups.value = Object.entries(data).map(([id, group]: [string, any]) => ({
        id,
        name: group.name,
        timeSlot: group.timeSlot
      }));
    } else {
      groups.value = [];
    }
  });
};

const loadStudents = (branchId: string, groupId: string) => {
  if (!branchId || !groupId) return;
  
  const studentsRef = dbRef(db, `branches/${branchId}/groups/${groupId}/students`);
  onValue(studentsRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      students.value = Object.entries(data).map(([id, student]: [string, any]) => ({
        id,
        name: student.name
      }));
      loadAttendance();
    } else {
      students.value = [];
    }
  });
};

const loadAttendance = async () => {
  if (!selectedBranch.value || !selectedGroup.value || !selectedDate.value || !selectedTime.value) return;

  const sanitizedTimeSlot = sanitizeTimeSlot(selectedTime.value);
  const attendanceRef = dbRef(
    db,
    `attendance/${selectedBranch.value}/${selectedGroup.value}/${selectedDate.value}/${sanitizedTimeSlot}`
  );

  onValue(attendanceRef, (snapshot) => {
    if (snapshot.exists()) {
      attendance.value = snapshot.val();
    } else {
      // Initialize attendance for all students as false
      attendance.value = students.value.reduce((acc, student) => {
        acc[student.id] = false;
        return acc;
      }, {} as Attendance);
    }
  });
};

const handleBranchChange = (branchId: string) => {
  selectedBranch.value = branchId;
  selectedGroup.value = '';
  selectedTime.value = '';
  students.value = [];
  attendance.value = {};
  loadGroups(branchId);
};

const handleGroupChange = (groupId: string) => {
  selectedGroup.value = groupId;
  selectedTime.value = '';
  students.value = [];
  attendance.value = {};
  if (selectedBranch.value && groupId) {
    const selectedGroupData = groups.value.find(g => g.id === groupId);
    if (selectedGroupData) {
      selectedTime.value = selectedGroupData.timeSlot;
    }
    loadStudents(selectedBranch.value, groupId);
  }
};

const handleDateChange = () => {
  attendance.value = {};
  loadAttendance();
};

const handleTimeChange = () => {
  attendance.value = {};
  loadAttendance();
};

const toggleAttendance = (studentId: string) => {
  attendance.value[studentId] = !attendance.value[studentId];
};

const sanitizeTimeSlot = (timeSlot: string): string => {
  return timeSlot.replace(/\./g, '_');
};

const saveAttendance = async () => {
  if (!selectedBranch.value || !selectedGroup.value || !selectedDate.value || !selectedTime.value) {
    error.value = 'Please select branch, group, date, and time';
    return;
  }

  loading.value = true;
  error.value = '';
  saveSuccess.value = false;

  try {
    const sanitizedTimeSlot = sanitizeTimeSlot(selectedTime.value);
    await set(
      dbRef(db, `attendance/${selectedBranch.value}/${selectedGroup.value}/${selectedDate.value}/${sanitizedTimeSlot}`),
      attendance.value
    );
    saveSuccess.value = true;
    setTimeout(() => {
      saveSuccess.value = false;
    }, 3000);
  } catch (e) {
    error.value = 'Failed to save attendance';
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const isWeekend = computed(() => {
  if (!selectedDate.value) return false;
  const date = new Date(selectedDate.value);
  return date.getDay() === 0 || date.getDay() === 6;
});
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <div class="py-10">
      <header>
        <div class="mx-auto px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-bold leading-tight text-gray-900">
            Take Attendance
          </h1>
          <p class="mt-1 text-sm text-gray-500">Track student attendance</p>
        </div>
      </header>

      <main>
        <div class="mx-auto sm:px-6 lg:px-8">
          <div class="px-4 py-8 sm:px-0">
            <div class="bg-white shadow rounded-lg p-6">
              <AttendanceSelectors
                :branches="branches"
                :groups="groups"
                :selected-branch="selectedBranch"
                :selected-group="selectedGroup"
                :selected-date="selectedDate"
                :selected-time="selectedTime"
                :is-weekend="isWeekend"
                @branch-change="handleBranchChange"
                @group-change="handleGroupChange"
                @date-change="handleDateChange"
                @time-change="handleTimeChange"
              />

              <div v-if="students.length > 0 && selectedTime">
                <AttendanceList
                  :students="students"
                  :attendance="attendance"
                  @toggle-attendance="toggleAttendance"
                />

                <AttendanceActions
                  :loading="loading"
                  :error="error"
                  :save-success="saveSuccess"
                  @save="saveAttendance"
                />
              </div>

              <div v-else-if="selectedGroup && !selectedTime" class="text-center py-4 text-gray-500">
                Please select a time slot to take attendance
              </div>

              <div v-else-if="selectedGroup" class="text-center py-4 text-gray-500">
                No students found in this group
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>