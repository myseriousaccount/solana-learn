<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

type QuestionMCQ = {
  type: 'mcq'
  q: string
  options: string[]
  correct: number[]
  explanation: string
}

type QuestionCommand = {
  type: 'command'
  q: string
  accepts: string[]
  ideal: string
  explanation: string
}

type QuestionScenario = {
  type: 'scenario'
  q: string
  ideal: string
  explanation: string
}

type QuestionOrder = {
  type: 'order'
  q: string
  items: string[]
  correctOrder: number[]
  explanation: string
}

type QuestionDiagnose = {
  type: 'diagnose'
  q: string
  options: string[]
  correct: number[]
  explanation: string
}

type QuestionCompare = {
  type: 'compare'
  q: string
  ideal: string
  explanation: string
}

type QuestionExplain = {
  type: 'explain'
  q: string
  ideal: string
  explanation: string
}

type Question =
  | QuestionMCQ
  | QuestionCommand
  | QuestionScenario
  | QuestionOrder
  | QuestionDiagnose
  | QuestionCompare
  | QuestionExplain

type QuizData = {
  id: string
  title: string
  intro?: string
  questions: Question[]
}

const props = defineProps<{ data: QuizData }>()

type AnswerState = {
  value: any
  submitted: boolean
  selfGrade?: 'correct' | 'partial' | 'incorrect' | null
}

function buildInitial(): Record<number, AnswerState> {
  const initial: Record<number, AnswerState> = {}
  for (let i = 0; i < props.data.questions.length; i++) {
    const q = props.data.questions[i]
    let initialValue: any = ''
    if (q.type === 'mcq' || q.type === 'diagnose') initialValue = []
    if (q.type === 'order') initialValue = [...Array(q.items.length).keys()]
    initial[i] = { value: initialValue, submitted: false, selfGrade: null }
  }
  return initial
}

const answers = ref<Record<number, AnswerState>>(buildInitial())

function reinit() {
  answers.value = buildInitial()
}

const storageKey = computed(() => `solana-learn-quiz-${props.data.id}`)

function save() {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(storageKey.value, JSON.stringify(answers.value))
  } catch {}
}

function load() {
  if (typeof localStorage === 'undefined') return
  try {
    const raw = localStorage.getItem(storageKey.value)
    if (!raw) return
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') {
      for (const k of Object.keys(parsed)) {
        answers.value[Number(k)] = parsed[k]
      }
    }
  } catch {}
}

function reset() {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(storageKey.value)
  }
  reinit()
}

watch(answers, save, { deep: true })

onMounted(load)

function normalizeCommand(s: string): string {
  return s.trim().replace(/\s+/g, ' ')
}

function checkCommand(input: string, accepts: string[]): boolean {
  const norm = normalizeCommand(input)
  return accepts.some(a => normalizeCommand(a) === norm)
}

function submitOne(i: number) {
  answers.value[i].submitted = true
}

function submitAll() {
  for (let i = 0; i < props.data.questions.length; i++) {
    answers.value[i].submitted = true
  }
}

function isCorrect(i: number): boolean | null {
  const a = answers.value[i]
  if (!a || !a.submitted) return null
  const q = props.data.questions[i]

  if (q.type === 'mcq' || q.type === 'diagnose') {
    const selected: number[] = (a.value as number[]).slice().sort()
    const correct = [...q.correct].sort()
    return JSON.stringify(selected) === JSON.stringify(correct)
  }

  if (q.type === 'command') {
    return checkCommand(a.value, q.accepts)
  }

  if (q.type === 'order') {
    return JSON.stringify(a.value) === JSON.stringify(q.correctOrder)
  }

  if (q.type === 'scenario' || q.type === 'compare' || q.type === 'explain') {
    return a.selfGrade === 'correct'
  }

  return null
}

function questionClass(i: number) {
  const a = answers.value[i]
  if (!a?.submitted) return ''
  const q = props.data.questions[i]
  const c = isCorrect(i)
  if (q.type === 'scenario' || q.type === 'compare' || q.type === 'explain') {
    if (a.selfGrade === 'correct') return 'correct'
    if (a.selfGrade === 'partial') return 'partial'
    if (a.selfGrade === 'incorrect') return 'incorrect'
    return ''
  }
  return c ? 'correct' : 'incorrect'
}

const score = computed(() => {
  let correct = 0
  let total = 0
  for (let i = 0; i < props.data.questions.length; i++) {
    if (answers.value[i]?.submitted) {
      total++
      if (isCorrect(i)) correct++
    }
  }
  return { correct, total }
})

const allSubmitted = computed(() =>
  props.data.questions.every((_, i) => answers.value[i]?.submitted)
)

function moveUp(i: number, idx: number) {
  if (idx === 0) return
  const arr = answers.value[i].value as number[]
  ;[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]
}

function moveDown(i: number, idx: number) {
  const arr = answers.value[i].value as number[]
  if (idx === arr.length - 1) return
  ;[arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]
}

function setSelfGrade(i: number, grade: 'correct' | 'partial' | 'incorrect') {
  answers.value[i].selfGrade = grade
}

const typeLabel: Record<Question['type'], string> = {
  mcq: 'MCQ',
  command: 'Write command',
  scenario: 'Scenario',
  order: 'Order',
  diagnose: 'Diagnose',
  compare: 'Compare',
  explain: 'Explain',
}
</script>

<template>
  <div class="quiz-block">
    <h3 class="quiz-title">{{ data.title }}</h3>
    <p v-if="data.intro" class="quiz-meta">{{ data.intro }}</p>

    <div
      v-for="(q, i) in data.questions"
      :key="i"
      class="quiz-question"
      :class="questionClass(i)"
    >
      <div>
        <span class="quiz-question-num">Питання {{ i + 1 }} з {{ data.questions.length }}</span>
        <span class="quiz-question-type-tag">{{ typeLabel[q.type] }}</span>
      </div>
      <p class="quiz-prompt">{{ q.q }}</p>

      <!-- MCQ / Diagnose -->
      <div v-if="q.type === 'mcq' || q.type === 'diagnose'" class="quiz-options">
        <div
          v-for="(opt, oi) in q.options"
          :key="oi"
          class="quiz-option"
          :class="{
            'correct-mark': answers[i]?.submitted && q.correct.includes(oi),
            'incorrect-mark':
              answers[i]?.submitted &&
              !q.correct.includes(oi) &&
              (answers[i].value as number[]).includes(oi),
          }"
        >
          <input
            type="checkbox"
            :id="`q-${data.id}-${i}-${oi}`"
            :value="oi"
            v-model="answers[i].value"
            :disabled="answers[i]?.submitted"
          />
          <label :for="`q-${data.id}-${i}-${oi}`">{{ opt }}</label>
        </div>
      </div>

      <!-- Command input -->
      <div v-else-if="q.type === 'command'">
        <input
          type="text"
          class="quiz-input"
          placeholder="Напиши команду..."
          v-model="answers[i].value"
          :disabled="answers[i]?.submitted"
          spellcheck="false"
          autocapitalize="off"
          autocomplete="off"
        />
      </div>

      <!-- Scenario / Compare / Explain — text + self-grade -->
      <div v-else-if="q.type === 'scenario' || q.type === 'compare' || q.type === 'explain'">
        <textarea
          class="quiz-textarea"
          placeholder="Напиши відповідь..."
          v-model="answers[i].value"
          :disabled="answers[i]?.submitted"
        ></textarea>
      </div>

      <!-- Order -->
      <div v-else-if="q.type === 'order'">
        <ul class="quiz-order-list">
          <li
            v-for="(itemIdx, idx) in (answers[i].value as number[])"
            :key="itemIdx"
            class="quiz-order-item"
          >
            <span class="order-num">{{ idx + 1 }}</span>
            <span>{{ q.items[itemIdx] }}</span>
            <div class="quiz-order-controls">
              <button
                @click="moveUp(i, idx)"
                :disabled="idx === 0 || answers[i]?.submitted"
                title="Вище"
              >↑</button>
              <button
                @click="moveDown(i, idx)"
                :disabled="idx === (answers[i].value as number[]).length - 1 || answers[i]?.submitted"
                title="Нижче"
              >↓</button>
            </div>
          </li>
        </ul>
      </div>

      <!-- Submit single question -->
      <div v-if="!answers[i]?.submitted" style="margin-top: 0.8rem;">
        <button class="quiz-btn quiz-btn-secondary" @click="submitOne(i)">
          Перевірити
        </button>
      </div>

      <!-- Feedback after submit -->
      <div v-if="answers[i]?.submitted">
        <!-- MCQ / Command / Order / Diagnose feedback -->
        <div
          v-if="['mcq', 'command', 'order', 'diagnose'].includes(q.type)"
          class="quiz-feedback"
          :class="isCorrect(i) ? 'correct' : 'incorrect'"
        >
          <span class="quiz-feedback-label">
            {{ isCorrect(i) ? '✓ Правильно' : '✗ Не зовсім' }}
          </span>
          <div v-if="q.type === 'command' && !isCorrect(i)">
            <div>Ідеальна відповідь:</div>
            <pre class="quiz-ideal">{{ (q as QuestionCommand).ideal }}</pre>
          </div>
          <div v-if="q.type === 'order' && !isCorrect(i)">
            <div>Правильний порядок:</div>
            <ol style="margin: 0.4rem 0 0 0; padding-left: 1.2rem;">
              <li v-for="idx in (q as QuestionOrder).correctOrder" :key="idx">
                {{ (q as QuestionOrder).items[idx] }}
              </li>
            </ol>
          </div>
          <div class="quiz-explanation">{{ q.explanation }}</div>
        </div>

        <!-- Scenario / Compare / Explain — self-grade -->
        <div
          v-else
          class="quiz-feedback"
          :class="
            answers[i].selfGrade === 'correct' ? 'correct' :
            answers[i].selfGrade === 'partial' ? 'partial' :
            answers[i].selfGrade === 'incorrect' ? 'incorrect' :
            'partial'
          "
        >
          <span class="quiz-feedback-label">Ідеальна відповідь:</span>
          <div class="quiz-ideal">{{ (q as any).ideal }}</div>
          <div class="quiz-explanation">{{ q.explanation }}</div>

          <div class="quiz-self-grade">
            <div class="quiz-self-grade-label">
              Як оцінюєш свою відповідь (порівняй з ідеальною)?
            </div>
            <div class="quiz-self-grade-buttons">
              <button
                :class="{ selected: answers[i].selfGrade === 'correct' }"
                @click="setSelfGrade(i, 'correct')"
              >✓ Правильно</button>
              <button
                :class="{ selected: answers[i].selfGrade === 'partial' }"
                @click="setSelfGrade(i, 'partial')"
              >~ Частково</button>
              <button
                :class="{ selected: answers[i].selfGrade === 'incorrect' }"
                @click="setSelfGrade(i, 'incorrect')"
              >✗ Невірно</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="quiz-actions">
      <button class="quiz-btn" @click="submitAll" :disabled="allSubmitted">
        Перевірити все
      </button>
      <button class="quiz-btn quiz-btn-secondary" @click="reset">
        Reset
      </button>
    </div>

    <div v-if="score.total > 0" class="quiz-score">
      <span class="quiz-score-num">{{ score.correct }} / {{ score.total }}</span>
      результатів перевірено
      <span v-if="allSubmitted"> · повний quiz пройдено</span>
    </div>
  </div>
</template>
