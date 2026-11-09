<script setup>
import { ref } from 'vue'
import BaseSelect from './BaseSelect.vue'
import BaseButton from './BaseButton.vue'
import { useLessons } from '../composables/useLessons.js'
import { useLessonTypes } from '../composables/useLessonTypes.js'
import { useSchedule } from '../composables/useSchedule.js'
import { buildBackup, parseBackup, downloadText } from '../utils/backup.js'

const { lessons, replaceLessons, mergeLessons, todayISO } = useLessons()
const { types, replaceTypes, mergeTypes } = useLessonTypes()
const { slots, replaceSlots, mergeSlots } = useSchedule()

const mode = ref('merge')
const modeOptions = [
  { value: 'merge', label: 'Додати до наявних (без дублікатів)' },
  { value: 'replace', label: 'Замінити всі дані' },
]

const fileInput = ref(null)
const message = ref('')
const isError = ref(false)

function show(text, error = false) {
  message.value = text
  isError.value = error
}

function exportData() {
  downloadText(`lessonlog-${todayISO()}.json`, buildBackup(types.value, lessons.value, slots.value))
  show(`Експортовано: ${lessons.value.length} уроків, ${types.value.length} типів.`)
}

async function onFileChosen(event) {
  const file = event.target.files?.[0]
  event.target.value = '' // щоб можна було обрати той самий файл ще раз
  if (!file) return

  try {
    const imported = parseBackup(await file.text())

    if (mode.value === 'replace') {
      if (!window.confirm('Усі поточні дані буде замінено даними з файлу. Продовжити?')) return
      replaceTypes(imported.types)
      replaceLessons(imported.lessons)
      if (imported.schedule) replaceSlots(imported.schedule)
      show(`Імпортовано: ${imported.lessons.length} уроків, ${imported.types.length} типів.`)
    } else {
      mergeTypes(imported.types)
      const added = mergeLessons(imported.lessons)
      if (imported.schedule) mergeSlots(imported.schedule)
      show(`Додано нових уроків: ${added} (з ${imported.lessons.length} у файлі).`)
    }
  } catch (e) {
    show(e.message, true)
  }
}
</script>

<template>
  <div class="backup">
    <h2>Резервна копія</h2>
    <p class="backup__hint">
      Експорт зберігає всі уроки, типи, ціни, тривалості й розклад в текстовий файл (JSON).
    </p>

    <BaseButton @click="exportData">Експортувати</BaseButton>

    <BaseSelect v-model="mode" label="Режим імпорту" :options="modeOptions" />
    <BaseButton variant="ghost" @click="fileInput.click()">Імпортувати з файлу…</BaseButton>
    <input ref="fileInput" type="file" accept=".json,application/json" hidden @change="onFileChosen" />

    <p v-if="message" class="backup__msg" :class="{ 'backup__msg--error': isError }">{{ message }}</p>
  </div>
</template>

<style scoped>
.backup {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  align-items: stretch;
}

.backup__hint {
  margin: 0;
  font-size: 0.9rem;
  color: var(--color-ink-soft);
}

.backup__msg {
  margin: 0;
  font-size: 0.9rem;
  color: var(--color-accent);
}

.backup__msg--error {
  color: var(--color-danger);
}
</style>