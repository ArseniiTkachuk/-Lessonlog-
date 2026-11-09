<script setup>
import { ref, computed } from 'vue'
import BaseInput from './BaseInput.vue'
import BaseSelect from './BaseSelect.vue'
import BaseButton from './BaseButton.vue'
import { useSchedule } from '../composables/useSchedule.js'
import { useLessonTypes } from '../composables/useLessonTypes.js'

const { slots, addSlot, removeSlot } = useSchedule()
const { types, getTypeById, getDefaultType } = useLessonTypes()

const WEEKDAYS = ['Понеділок', 'Вівторок', 'Середа', 'Четвер', "П'ятниця", 'Субота', 'Неділя']
const weekdayOptions = WEEKDAYS.map((label, i) => ({ value: String(i + 1), label }))

const weekday = ref('1')
const typeId = ref(getDefaultType()?.id ?? '')
const count = ref('1')
const note = ref('')

const typeOptions = computed(() => types.value.map((t) => ({ value: t.id, label: t.name })))

const sortedSlots = computed(() => [...slots.value].sort((a, b) => a.weekday - b.weekday))

function submit() {
  if (!typeId.value) return
  addSlot({ weekday: weekday.value, typeId: typeId.value, count: count.value, note: note.value })
  count.value = '1'
  note.value = ''
}
</script>

<template>
  <div class="schedule">
    <h2>Тижневий розклад</h2>
    <p class="schedule__hint">
      Задайте регулярні уроки один раз. На вкладці «Уроки» застосунок запропонує додати їх за поточний
      тиждень, а вам лишиться прибрати ті, що не відбулися.
    </p>

    <ul v-if="sortedSlots.length" class="schedule__list">
      <li v-for="slot in sortedSlots" :key="slot.id" class="schedule__row">
        <span class="schedule__day">{{ WEEKDAYS[slot.weekday - 1] }}</span>
        <span class="schedule__what">
          {{ getTypeById(slot.typeId)?.name ?? 'Видалений тип' }}
          <template v-if="slot.count > 1"> × {{ slot.count }}</template>
          <small v-if="slot.note"> · {{ slot.note }}</small>
        </span>
        <button class="schedule__remove" aria-label="Видалити з розкладу" @click="removeSlot(slot.id)">
          ✕
        </button>
      </li>
    </ul>
    <p v-else class="schedule__empty">Розклад поки порожній.</p>

    <form class="schedule__form" @submit.prevent="submit">
      <div class="schedule__grid">
        <BaseSelect v-model="weekday" label="День" :options="weekdayOptions" />
        <BaseSelect v-model="typeId" label="Тип уроку" :options="typeOptions" />
      </div>
      <div class="schedule__grid">
        <BaseInput v-model="count" type="number" min="1" step="1" label="Кількість уроків" />
        <BaseInput v-model="note" label="Нотатка" placeholder="Напр. ім'я учня" />
      </div>
      <BaseButton type="submit">Додати до розкладу</BaseButton>
    </form>
  </div>
</template>

<style scoped>
.schedule {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.schedule__hint,
.schedule__empty {
  margin: 0;
  font-size: 0.9rem;
  color: var(--color-ink-soft);
}

.schedule__list {
  list-style: none;
  margin: 0;
  padding: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.schedule__row {
  display: grid;
  grid-template-columns: 6.5rem 1fr auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 1rem;
  border-bottom: 1px solid var(--color-border);
}

.schedule__row:last-child {
  border-bottom: none;
}

.schedule__day {
  font-weight: 500;
}

.schedule__what small {
  color: var(--color-ink-soft);
}

.schedule__remove {
  border: none;
  background: transparent;
  color: var(--color-ink-soft);
  cursor: pointer;
  opacity: 0.6;
}

.schedule__remove:hover {
  opacity: 1;
  color: var(--color-danger);
}

.schedule__form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.schedule__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
}
</style>