<script setup>
import { ref, computed, watch } from 'vue'
import BaseInput from './BaseInput.vue'
import BaseSelect from './BaseSelect.vue'
import BaseButton from './BaseButton.vue'
import DurationPicker from './DurationPicker.vue'
import { useLessonTypes } from '../composables/useLessonTypes.js'
import { useLessons } from '../composables/useLessons.js'

const props = defineProps({
  // Якщо передано урок — форма працює в режимі редагування
  lesson: { type: Object, default: null },
})
const emit = defineEmits(['close'])

const isEdit = computed(() => Boolean(props.lesson))

const { types, getTypeById, getDefaultType } = useLessonTypes()
const { addLessons, updateLesson, todayISO } = useLessons()

const date = ref(props.lesson?.date ?? todayISO())
const typeId = ref(props.lesson?.typeId ?? getDefaultType()?.id ?? '')
const hours = ref(props.lesson ? props.lesson.hours : getDefaultType()?.duration ?? 1)
const count = ref('1')
const note = ref(props.lesson?.note ?? '')

// При зміні типу підставляємо його тривалість із налаштувань
watch(typeId, (id) => {
  const type = getTypeById(id)
  if (type) hours.value = type.duration
})

const typeOptions = () => types.value.map((t) => ({ value: t.id, label: t.name }))

function submit() {
  if (!typeId.value || !hours.value) return

  if (isEdit.value) {
    const changes = {
      date: date.value,
      typeId: typeId.value,
      hours: Number(hours.value),
      note: note.value,
    }
    // Ціна змінюється лише якщо змінили тип; інакше лишається та, що була в уроці
    if (typeId.value !== props.lesson.typeId) {
      changes.price = Number(getTypeById(typeId.value)?.price) || 0
    }
    updateLesson(props.lesson.id, changes)
  } else {
    const n = Math.min(20, Math.max(1, Math.floor(Number(count.value)) || 1))
    addLessons(
        {
          date: date.value,
          typeId: typeId.value,
          hours: hours.value,
          note: note.value,
          price: getTypeById(typeId.value)?.price ?? 0, // ціна «заморожується» в уроці
        },
        n
    )
  }
  emit('close')
}
</script>

<template>
  <div class="form-sheet">
    <div class="form-sheet__header">
      <h2>{{ isEdit ? 'Редагувати урок' : 'Новий урок' }}</h2>
      <button class="form-sheet__close" aria-label="Закрити" @click="$emit('close')">✕</button>
    </div>

    <form class="form-sheet__body" @submit.prevent="submit">
      <BaseInput v-model="date" type="date" label="Дата" />
      <BaseSelect v-model="typeId" label="Тип уроку" :options="typeOptions()" />
      <DurationPicker v-model="hours" :label="isEdit ? 'Тривалість' : 'Тривалість кожного уроку'" />
      <BaseInput v-if="!isEdit" v-model="count" type="number" min="1" step="1" label="Кількість уроків" />
      <BaseInput v-model="note" label="Нотатка (необов'язково)" placeholder="Напр. ім'я учня" />

      <div class="form-sheet__actions">
        <BaseButton variant="ghost" type="button" @click="$emit('close')">Скасувати</BaseButton>
        <BaseButton variant="primary" type="submit">{{ isEdit ? 'Зберегти' : 'Додати' }}</BaseButton>
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