<script setup>
import { ref } from 'vue'
import BaseInput from './BaseInput.vue'
import BaseSelect from './BaseSelect.vue'
import BaseButton from './BaseButton.vue'
import DurationPicker from './DurationPicker.vue'
import { useLessonTypes } from '../composables/useLessonTypes.js'
import { useLessons } from '../composables/useLessons.js'

const emit = defineEmits(['close'])

const { types } = useLessonTypes()
const { addLesson, todayISO } = useLessons()

const date = ref(todayISO())
const typeId = ref(types.value[0]?.id ?? '')
const hours = ref(1)
const note = ref('')

const typeOptions = () => types.value.map((t) => ({ value: t.id, label: t.name }))

function submit() {
  if (!typeId.value || !hours.value) return
  addLesson({ date: date.value, typeId: typeId.value, hours: hours.value, note: note.value })
  emit('close')
}
</script>

<template>
  <div class="form-sheet">
    <div class="form-sheet__header">
      <h2>Новий урок</h2>
      <button class="form-sheet__close" aria-label="Закрити" @click="$emit('close')">✕</button>
    </div>

    <form class="form-sheet__body" @submit.prevent="submit">
      <BaseInput v-model="date" type="date" label="Дата" />
      <BaseSelect v-model="typeId" label="Тип уроку" :options="typeOptions()" />
      <DurationPicker v-model="hours" label="Тривалість" />
      <BaseInput v-model="note" label="Нотатка (необов'язково)" placeholder="Напр. ім'я учня" />

      <div class="form-sheet__actions">
        <BaseButton variant="ghost" type="button" @click="$emit('close')">Скасувати</BaseButton>
        <BaseButton variant="primary" type="submit">Додати урок</BaseButton>
      </div>
    </form>
  </div>
</template>

<style scoped>
.form-sheet {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  border: 1px solid var(--color-border);
}

.form-sheet__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.form-sheet__close {
  border: none;
  background: transparent;
  font-size: 1.1rem;
  color: var(--color-ink-soft);
  cursor: pointer;
  line-height: 1;
}

.form-sheet__body {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.form-sheet__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.25rem;
}
</style>
