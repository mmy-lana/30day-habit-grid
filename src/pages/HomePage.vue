<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import type { DayKey, Habit, HabitCategory, HabitInput } from '@/types/habit';
import type { GlobalStats } from '@/types/stats';
import type { HabitStoreState } from '@/types/store';
import { useHabitStore } from '@/composables/useHabitStore';
import { useDateGrid } from '@/composables/useDateGrid';
import { useTheme } from '@/composables/useTheme';
import { exportBackup, readBackupFile } from '@/utils/backup';
import { GRID_DAYS } from '@/constants/grid';
import AppHeader from '@/components/organisms/AppHeader.vue';
import CombinedGrid from '@/components/organisms/CombinedGrid.vue';
import HabitList from '@/components/organisms/HabitList.vue';
import Modal from '@/components/molecules/Modal.vue';
import ConfirmDialog from '@/components/molecules/ConfirmDialog.vue';
import HabitForm from '@/components/molecules/HabitForm.vue';
import CategoryFilterBar from '@/components/molecules/CategoryFilterBar.vue';
import StatTile from '@/components/atoms/StatTile.vue';

const store = useHabitStore();
const { dayKeys } = useDateGrid(GRID_DAYS);
const { isDark, toggleTheme } = useTheme();

const globalStats = computed<GlobalStats>(() => store.globalStats(dayKeys.value));

const selectedCategory = ref<'all' | HabitCategory>('all');

const filteredHabits = computed<Habit[]>(() =>
  selectedCategory.value === 'all'
    ? store.habits.value
    : store.habits.value.filter((habit) => habit.category === selectedCategory.value),
);

const modalState = reactive<{ mode: 'closed' | 'add' | 'edit'; id?: string }>({
  mode: 'closed',
});

const confirmDeleteId = ref<string | null>(null);
const pendingImport = ref<HabitStoreState | null>(null);

const modalOpen = computed(() => modalState.mode !== 'closed');

const editingHabit = computed<Habit | null>(() => {
  if (modalState.mode !== 'edit' || modalState.id == null) return null;
  return store.getHabit(modalState.id) ?? null;
});

const habitPendingDelete = computed<Habit | null>(() =>
  confirmDeleteId.value == null ? null : (store.getHabit(confirmDeleteId.value) ?? null),
);

function openAdd(): void {
  modalState.mode = 'add';
  modalState.id = undefined;
}

function openEdit(id: string): void {
  modalState.mode = 'edit';
  modalState.id = id;
}

function closeModal(): void {
  modalState.mode = 'closed';
  modalState.id = undefined;
}

function handleSubmit(input: HabitInput): void {
  if (modalState.mode === 'edit' && modalState.id != null) {
    store.updateHabit(modalState.id, input);
  } else {
    store.addHabit(input);
  }
  closeModal();
}

function handleToggle(habitId: string, day: DayKey): void {
  store.toggleDay(habitId, day);
}

function handleDelete(habitId: string): void {
  confirmDeleteId.value = habitId;
}

function confirmDelete(): void {
  if (confirmDeleteId.value != null) store.deleteHabit(confirmDeleteId.value);
  confirmDeleteId.value = null;
}

function handleExport(): void {
  exportBackup(store.state.value);
}

async function handleImportFile(file: File): Promise<void> {
  try {
    const parsed = await readBackupFile(file);
    if (store.habits.value.length > 0) {
      pendingImport.value = parsed; // gate overwrite behind ConfirmDialog
    } else {
      store.importState(parsed);
    }
  } catch (err) {
    console.warn('habit-grid: import failed', err);
  }
}

function confirmImport(): void {
  if (pendingImport.value != null) store.importState(pendingImport.value);
  pendingImport.value = null;
}

function cancelImport(): void {
  pendingImport.value = null;
}
</script>

<template>
  <AppHeader
    :global-stats="globalStats"
    :is-dark="isDark"
    @toggle-theme="toggleTheme"
    @add-habit="openAdd"
    @export-data="handleExport"
    @import-file="handleImportFile"
  />

  <CombinedGrid
    :days="dayKeys"
    :global-stats="globalStats"
    :total-habits="store.habits.value.length"
  />

  <!-- Mobile-only global stats strip (desktop stats live in AppHeader). -->
  <div
    class="mt-4 flex gap-6 overflow-x-auto md:hidden"
    aria-label="Global stats"
  >
    <StatTile
      label="Habits"
      :value="globalStats.totalHabits"
    />
    <StatTile
      label="Completions"
      :value="globalStats.totalCompletions"
    />
    <StatTile
      label="Best streak"
      :value="globalStats.bestStreak"
      tone="accent"
    />
  </div>

  <CategoryFilterBar
    v-if="store.habits.value.length > 0"
    v-model="selectedCategory"
    class="mt-4"
  />

  <div class="mt-4">
    <HabitList
      :habits="filteredHabits"
      :days="dayKeys"
      :category-filter="selectedCategory"
      @toggle="handleToggle"
      @edit="openEdit"
      @delete="handleDelete"
      @add="openAdd"
      @clear-filter="selectedCategory = 'all'"
    />
  </div>

  <Modal
    :open="modalOpen"
    :title="modalState.mode === 'edit' ? 'Edit habit' : 'Add habit'"
    @close="closeModal"
  >
    <HabitForm
      :habit="editingHabit"
      @submit="handleSubmit"
      @cancel="closeModal"
    />
  </Modal>

  <ConfirmDialog
    :open="confirmDeleteId != null"
    title="Delete habit?"
    :message="`This will permanently remove “${habitPendingDelete?.name ?? ''}” and all of its check-ins.`"
    confirm-text="Delete"
    danger
    @confirm="confirmDelete"
    @cancel="confirmDeleteId = null"
  />

  <ConfirmDialog
    :open="pendingImport != null"
    title="Import backup?"
    message="Importing this backup will overwrite your current habits and check-in history. Do you want to continue?"
    confirm-text="Import"
    @confirm="confirmImport"
    @cancel="cancelImport"
  />
</template>