<script setup>
import { ref } from 'vue'
import BaseInput from './BaseInput.vue'
import BaseButton from './BaseButton.vue'
import { useLessonTypes } from '../composables/useLessonTypes.js'

const { types, addType, updateType, removeType } = useLessonTypes()

const newTypeName = ref('')

function submitNewType() {
  if (!newTypeName.value.trim()) return
  addType(newTypeName.value.trim())
  newTypeName.value = ''
}
</script>

<template>
  <div class="type-settings">
    <h2>Типи уроків і ціни</h2>

    <ul class="type-settings__list">
      <li v-for="type in types" :key="type.id" class="type-settings__row">
        <span class="type-settings__name">{{ type.name }}</span>
        <div class="type-settings__price">
          <input
            class="type-settings__price-input"
            type="number"
            min="0"
            :value="type.price"
            @input="updateType(type.id, { price: $event.target.value })"
          />
          <span class="type-settings__unit">₴/урок</span>
        </div>
        <button class="type-settings__remove" aria-label="Видалити тип" @click="removeType(type.id)">
          ✕
        </button>
      </li>
    </ul>

    <form class="type-settings__add" @submit.prevent="submitNewType">
      <BaseInput v-model="newTypeName" placeholder="Новий тип уроку, напр. Пробний" />
      <BaseButton type="submit">Додати тип</BaseButton>
    </form>
  </div>
</template>

<style scoped>
.type-settings {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.type-settings__list {
  list-style: none;
  margin: 0;
  padding: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.type-settings__row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-border);
}

.type-settings__row:last-child {
  border-bottom: none;
}

.type-settings__name {
  flex: 1;
  font-weight: 500;
}

.type-settings__price {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.type-settings__price-input {
  width: 4.5rem;
  padding: 0.4rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
  text-align: right;
}

.type-settings__unit {
  font-size: 0.85rem;
  color: var(--color-ink-soft);
}

.type-settings__remove {
  border: none;
  background: transparent;
  color: var(--color-ink-soft);
  cursor: pointer;
  opacity: 0.6;
}

.type-settings__remove:hover {
  opacity: 1;
  color: var(--color-danger);
}

.type-settings__add {
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
}

.type-settings__add :deep(.base-field) {
  flex: 1;
}
</style>
