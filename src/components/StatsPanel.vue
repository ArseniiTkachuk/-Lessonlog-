<script setup>
import { ref, computed, watch } from 'vue'
import AppTabs from './AppTabs.vue'
import BaseSelect from './BaseSelect.vue'
import BaseButton from './BaseButton.vue'
import ChartPanel from './ChartPanel.vue'
import { useLessons } from '../composables/useLessons.js'
import { useLessonTypes } from '../composables/useLessonTypes.js'
import { formatDuration } from '../utils/duration.js'
import { buildReport, REPORT_KINDS } from '../utils/reports.js'
import { downloadText } from '../utils/backup.js'
import {
  PERIOD_TABS,
  periodKey,
  currentPeriodKey,
  prevPeriodKey,
  periodLabel,
  monthName,
} from '../utils/period.js'

const { lessons, lessonPrice } = useLessons()
const { types } = useLessonTypes()

const mode = ref('month') // 'month' | 'year'
const selected = ref(currentPeriodKey('month'))

watch(mode, (m) => {
  selected.value = currentPeriodKey(m)
})

const periodOptions = computed(() => {
  const keys = new Set(lessons.value.map((l) => periodKey(mode.value, l.date)))
  keys.add(currentPeriodKey(mode.value))
  return [...keys]
      .sort()
      .reverse()
      .map((key) => ({ value: key, label: periodLabel(mode.value, key) }))
})

function formatMoney(n) {
  return `${Math.round(n).toLocaleString('uk-UA')} ₴`
}

function inPeriod(key) {
  return lessons.value.filter((l) => periodKey(mode.value, l.date) === key)
}

function summarize(list) {
  const count = list.length
  const hours = list.reduce((s, l) => s + (Number(l.hours) || 0), 0)
  const earnings = list.reduce((s, l) => s + lessonPrice(l), 0)
  return {
    count,
    hours,
    earnings,
    perHour: hours > 0 ? earnings / hours : 0,
    avgLesson: count > 0 ? earnings / count : 0,
  }
}

const current = computed(() => summarize(inPeriod(selected.value)))
const prevKey = computed(() => prevPeriodKey(mode.value, selected.value))
const previous = computed(() => summarize(inPeriod(prevKey.value)))
const hasPrevious = computed(() => previous.value.count > 0)

const statsByType = computed(() => {
  const list = inPeriod(selected.value)
  const rows = types.value.map((type) => ({
    ...type,
    ...summarize(list.filter((l) => l.typeId === type.id)),
  }))
  // «Найвигідніший» — найвищий заробіток за годину (має сенс, коли є з чим порівнювати)
  const comparable = rows.filter((r) => r.count > 0 && r.perHour > 0)
  const bestId =
      comparable.length >= 2
          ? comparable.reduce((a, b) => (b.perHour > a.perHour ? b : a)).id
          : null
  return rows.map((r) => ({ ...r, isBest: r.id === bestId }))
})

/** Розбивка по місяцях для року. */
const monthBreakdown = computed(() => {
  if (mode.value === 'month') return []
  const byMonth = new Map()
  for (const l of inPeriod(selected.value)) {
    const key = l.date.slice(0, 7)
    if (!byMonth.has(key)) byMonth.set(key, [])
    byMonth.get(key).push(l)
  }
  return [...byMonth.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, list]) => ({ key, label: monthName(key), ...summarize(list) }))
})

// ---- Порівняння з попереднім періодом ----
const ARROWS = { up: '↑', down: '↓', same: '→' }

function delta(cur, prev) {
  if (!hasPrevious.value || !prev) return null
  const diff = cur - prev
  return {
    diff,
    pct: Math.round((diff / prev) * 100),
    dir: diff > 0 ? 'up' : diff < 0 ? 'down' : 'same',
  }
}

function deltaText(d, fmt) {
  const sign = d.diff > 0 ? '+' : d.diff < 0 ? '−' : ''
  return `${ARROWS[d.dir]} ${Math.abs(d.pct)}% (${sign}${fmt(Math.abs(d.diff))})`
}

const earningsDelta = computed(() => delta(current.value.earnings, previous.value.earnings))
const hoursDelta = computed(() => delta(current.value.hours, previous.value.hours))

// ---- Звіти ----
const comparisonText = computed(() => {
  const parts = []
  if (earningsDelta.value) parts.push(`заробіток ${deltaText(earningsDelta.value, formatMoney)}`)
  if (hoursDelta.value) parts.push(`час ${deltaText(hoursDelta.value, formatDuration)}`)
  if (!parts.length) return ''
  return `Порівняно з періодом «${periodLabel(mode.value, prevKey.value)}»: ${parts.join(', ')}`
})

const reportKind = ref('full')
const reportMeta = computed(() => REPORT_KINDS.find((k) => k.value === reportKind.value))

const reportText = computed(() =>
    buildReport(reportKind.value, {
      mode: mode.value,
      label: periodLabel(mode.value, selected.value),
      lessons: inPeriod(selected.value),
      types: types.value,
      price: lessonPrice,
      comparison: comparisonText.value,
    })
)

const copied = ref(false)

function fallbackCopy(text) {
  const ta = document.createElement('textarea')
  ta.value = text
  ta.style.position = 'fixed'
  ta.style.opacity = '0'
  document.body.appendChild(ta)
  ta.select()
  try {
    document.execCommand('copy')
  } finally {
    ta.remove()
  }
}

async function copyReport() {
  const text = reportText.value
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    fallbackCopy(text)
  }
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

function downloadReport() {
  downloadText(
      `zvit-${reportKind.value}-${selected.value}.txt`,
      reportText.value,
      'text/plain;charset=utf-8'
  )
}
</script>

<template>
  <div class="stats">
    <AppTabs v-model="mode" :tabs="PERIOD_TABS" />
    <BaseSelect v-model="selected" label="Період" :options="periodOptions" />

    <div class="stats__cards">
      <article v-for="type in statsByType" :key="type.id" class="stats__card">
        <h3>
          {{ type.name }}
          <span v-if="type.isBest" class="stats__best" title="Найвищий заробіток за годину">★</span>
        </h3>
        <dl>
          <div class="stats__row">
            <dt>Уроків</dt>
            <dd>{{ type.count }}</dd>
          </div>
          <div class="stats__row">
            <dt>Час</dt>
            <dd>{{ formatDuration(type.hours) }}</dd>
          </div>
          <template v-if="type.earnings > 0">
            <div class="stats__row">
              <dt>Заробіток</dt>
              <dd>{{ formatMoney(type.earnings) }}</dd>
            </div>
            <div class="stats__row">
              <dt>За годину</dt>
              <dd>{{ formatMoney(type.perHour) }}</dd>
            </div>
            <div class="stats__row">
              <dt>Сер. урок</dt>
              <dd>{{ formatMoney(type.avgLesson) }}</dd>
            </div>
          </template>
        </dl>
      </article>
    </div>
    <p v-if="statsByType.some((t) => t.isBest)" class="stats__hint">
      ★ — найвищий заробіток за годину
    </p>

    <div class="stats__total">
      <div>
        <span class="stats__total-label">Разом часу</span>
        <strong>{{ formatDuration(current.hours) }}</strong>
        <span v-if="hoursDelta" class="delta" :class="`delta--${hoursDelta.dir}`">
          {{ deltaText(hoursDelta, formatDuration) }}
        </span>
      </div>
      <div>
        <span class="stats__total-label">Разом заробіток</span>
        <strong>{{ formatMoney(current.earnings) }}</strong>
        <span v-if="earningsDelta" class="delta" :class="`delta--${earningsDelta.dir}`">
          {{ deltaText(earningsDelta, formatMoney) }}
        </span>
      </div>
      <template v-if="current.earnings > 0">
        <div>
          <span class="stats__total-label">Середній урок</span>
          <strong>{{ formatMoney(current.avgLesson) }}</strong>
        </div>
        <div>
          <span class="stats__total-label">Заробіток за годину</span>
          <strong>{{ current.hours > 0 ? formatMoney(current.perHour) : '—' }}</strong>
        </div>
      </template>
    </div>
    <p v-if="hasPrevious" class="stats__hint">
      Порівняння з періодом: {{ periodLabel(mode, prevKey) }}
    </p>

    <section v-if="monthBreakdown.length" class="breakdown">
      <h3>По місяцях</h3>
      <ul>
        <li v-for="m in monthBreakdown" :key="m.key" class="breakdown__row">
          <span class="breakdown__name">{{ m.label }}</span>
          <span>{{ m.count }} ур.</span>
          <span>{{ formatDuration(m.hours) }}</span>
          <span class="breakdown__money">{{ m.earnings > 0 ? formatMoney(m.earnings) : '' }}</span>
        </li>
      </ul>
    </section>

    <section class="report">
      <h3>Звіт</h3>
      <BaseSelect v-model="reportKind" label="Тип звіту" :options="REPORT_KINDS" />
      <p class="report__desc">{{ reportMeta.description }}</p>
      <pre class="report__preview">{{ reportText }}</pre>
      <div class="report__actions">
        <BaseButton @click="copyReport">{{ copied ? 'Скопійовано ✓' : 'Копіювати' }}</BaseButton>
        <BaseButton variant="ghost" @click="downloadReport">Завантажити .txt</BaseButton>
      </div>
    </section>

    <ChartPanel />
  </div>
</template>

<style scoped>
.stats {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.stats__cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.75rem;
}

.stats__card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1rem;
}

.stats__card h3 {
  font-size: 1rem;
  margin-bottom: 0.6rem;
}

.stats__best {
  color: var(--color-warm);
  margin-left: 0.2rem;
}

.stats__hint {
  margin: -0.6rem 0 0;
  font-size: 0.8rem;
  color: var(--color-ink-soft);
}

.stats__row {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--color-ink-soft);
  padding: 0.15rem 0;
}

.stats__row dd {
  margin: 0;
  color: var(--color-ink);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.stats__total {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem 1.25rem;
  background: var(--color-warm-soft);
  border-radius: var(--radius-md);
  padding: 1rem 1.25rem;
}

.stats__total-label {
  display: block;
  font-size: 0.8rem;
  color: var(--color-ink-soft);
  margin-bottom: 0.2rem;
}

.stats__total strong {
  font-family: var(--font-display);
  font-size: 1.3rem;
  color: var(--color-warm);
}

.delta {
  display: block;
  margin-top: 0.15rem;
  font-size: 0.78rem;
  font-variant-numeric: tabular-nums;
}

.delta--up {
  color: var(--color-accent);
}

.delta--down {
  color: var(--color-danger);
}

.delta--same {
  color: var(--color-ink-soft);
}

.breakdown h3 {
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.breakdown ul {
  list-style: none;
  margin: 0;
  padding: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.breakdown__row {
  display: grid;
  grid-template-columns: 1fr auto auto 5.5rem;
  gap: 0.75rem;
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  color: var(--color-ink-soft);
  border-bottom: 1px solid var(--color-border);
  font-variant-numeric: tabular-nums;
}

.breakdown__row:last-child {
  border-bottom: none;
}

.breakdown__name {
  color: var(--color-ink);
  font-weight: 500;
}

.breakdown__money {
  text-align: right;
  color: var(--color-ink);
}

.report {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.report h3 {
  font-size: 1rem;
}

.report__desc {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-ink-soft);
}

.report__preview {
  margin: 0;
  padding: 0.85rem 1rem;
  max-height: 20rem;
  overflow: auto;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-ink);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.8rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.report__actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
</style>