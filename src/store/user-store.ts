// User store — hydrates from Capacitor Preferences. Single source of truth for
// display name, archetype, assessment progress, and recent mood data.
//
// All defaults are null/empty: nothing fake ships. UI gates rich layouts behind
// `assessmentComplete` and renders empty-states until real data arrives.

import { create } from 'zustand'
import { Preferences } from '@capacitor/preferences'

const STORAGE_KEY = 'engram.user.v1'
const MAX_MOOD_HISTORY = 7

export interface Archetype {
  name: string
  code: string
  vector: number
}

interface UserState {
  displayName: string | null
  archetype: Archetype | null
  assessmentComplete: boolean
  dailyMood: number | null
  last7DaysMoods: number[]
  hasInsights: boolean
  hydrated: boolean

  hydrate: () => Promise<void>
  setDisplayName: (name: string | null) => Promise<void>
  setArchetype: (archetype: Archetype | null) => Promise<void>
  setAssessmentComplete: (complete: boolean) => Promise<void>
  setDailyMood: (mood: number) => Promise<void>
  setHasInsights: (has: boolean) => Promise<void>
  reset: () => Promise<void>
}

interface PersistedShape {
  displayName: string | null
  archetype: Archetype | null
  assessmentComplete: boolean
  dailyMood: number | null
  last7DaysMoods: number[]
  hasInsights: boolean
}

const DEFAULTS: PersistedShape = {
  displayName: null,
  archetype: null,
  assessmentComplete: false,
  dailyMood: null,
  last7DaysMoods: [],
  hasInsights: false,
}

async function persist(state: PersistedShape): Promise<void> {
  try {
    await Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(state) })
  } catch (error: unknown) {
    // Preferences write failed; surface in dev but don't crash the UI.
    if (typeof window !== 'undefined' && (window as { __DEV__?: boolean }).__DEV__) {
      // eslint-disable-next-line no-console
      console.warn('user-store persist failed', error)
    }
  }
}

function snapshot(state: UserState): PersistedShape {
  return {
    displayName: state.displayName,
    archetype: state.archetype,
    assessmentComplete: state.assessmentComplete,
    dailyMood: state.dailyMood,
    last7DaysMoods: state.last7DaysMoods,
    hasInsights: state.hasInsights,
  }
}

export const useUserStore = create<UserState>((set, get) => ({
  ...DEFAULTS,
  hydrated: false,

  hydrate: async () => {
    try {
      const { value } = await Preferences.get({ key: STORAGE_KEY })
      if (!value) {
        set({ hydrated: true })
        return
      }
      const parsed: unknown = JSON.parse(value)
      if (parsed && typeof parsed === 'object') {
        const p = parsed as Partial<PersistedShape>
        set({
          displayName: p.displayName ?? null,
          archetype: p.archetype ?? null,
          assessmentComplete: p.assessmentComplete ?? false,
          dailyMood: p.dailyMood ?? null,
          last7DaysMoods: Array.isArray(p.last7DaysMoods) ? p.last7DaysMoods : [],
          hasInsights: p.hasInsights ?? false,
          hydrated: true,
        })
        return
      }
      set({ hydrated: true })
    } catch {
      set({ hydrated: true })
    }
  },

  setDisplayName: async (name) => {
    set({ displayName: name })
    await persist(snapshot(get()))
  },

  setArchetype: async (archetype) => {
    set({ archetype })
    await persist(snapshot(get()))
  },

  setAssessmentComplete: async (complete) => {
    set({ assessmentComplete: complete })
    await persist(snapshot(get()))
  },

  setDailyMood: async (mood) => {
    const next = [...get().last7DaysMoods, mood].slice(-MAX_MOOD_HISTORY)
    set({ dailyMood: mood, last7DaysMoods: next })
    await persist(snapshot(get()))
  },

  setHasInsights: async (has) => {
    set({ hasInsights: has })
    await persist(snapshot(get()))
  },

  reset: async () => {
    set({ ...DEFAULTS })
    await Preferences.remove({ key: STORAGE_KEY })
  },
}))
