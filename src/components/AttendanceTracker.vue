<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { db } from '../firebase';
import { ref as dbRef, onValue, set } from 'firebase/database';

interface Branch {
  id: string;
  name: string;
}

interface Group {
  id: string;
  name: string;
  branchId: string;
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

// Sanitize time slot for Firebase path
const sanitizeTimeSlot = (timeSlot: string): string => {
  return timeSlot.replace(/\./g, '_');
};

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
        branchId,
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

const selectedGroupData = computed(() => {
  return groups.value.find(g => g.id === selectedGroup.value);
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
              <!-- Selection Controls -->
              <div class="grid grid-cols-1 gap-6 sm:grid-cols-4 mb-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Branch</label>
                  <select
                    v-model="selectedBranch"
                    @change="handleBranchChange($event.target.value)"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Select Branch</option>
                    <option v-for="branch in branches" :key="branch.id" :value="branch.id">
                      {{ branch.name }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Group</label>
                  <select
                    v-model="selectedGroup"
                    @change="handleGroupChange($event.target.value)"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    :disabled="!selectedBranch"
                  >
                    <option value="">Select Group</option>
                    <option v-for="group in groups" :key="group.id" :value="group.id">
                      {{ group.name }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    v-model="selectedDate"
                    @change="handleDateChange"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Time Slot</label>
                  <input
                    type="text"
                    v-model="selectedTime"
                    @change="handleTimeChange"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50"
                    readonly
                    :placeholder="selectedGroupData?.timeSlot || 'Select a group first'"
                  />
                </div>
              </div>

              <div v-if="isWeekend" class="mb-4 p-4 bg-yellow-50 rounded-md">
                <p class="text-yellow-700">
                  Note: The selected date is a weekend.
                </p>
              </div>

              <!-- Attendance List -->
              <div v-if="students.length > 0 && selectedTime" class="mt-6">
                <div class="space-y-4">
                  <div v-for="student in students" :key="student.id" 
                       class="flex items-center justify-between p-4 border rounded-lg">
                    <span class="font-medium">{{ student.name }}</span>
                    <button
                      @click="toggleAttendance(student.id)"
                      :class="[
                        'px-4 py-2 rounded-md text-sm font-medium',
                        attendance[student.id]
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      ]"
                    >
                      {{ attendance[student.id] ? 'Present' : 'Absent' }}
                    </button>
                  </div>
                </div>

                <div class="mt-6 flex items-center justify-end space-x-4">
                  <p v-if="error" class="text-red-500">{{ error }}</p>
                  <p v-if="saveSuccess" class="text-green-500">Attendance saved successfully!</p>
                  <button
                    @click="saveAttendance"
                    :disabled="loading"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {{ loading ? 'Saving...' : 'Save Attendance' }}
                  </button>
                </div>
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