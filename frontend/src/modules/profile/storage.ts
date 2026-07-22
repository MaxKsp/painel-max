import { useSyncExternalStore } from "react"

export interface ProfileData {
  name: string
  email: string
  phone: string
  city: string
  bio: string
}

export const PROFILE_KEY = "level-os:profile:v1"
const PROFILE_EVENT = "level-profile-change"

export const DEFAULT_PROFILE: ProfileData = {
  name: "Usuário",
  email: "",
  phone: "",
  city: "",
  bio: "Evoluindo finanças, rotina e saúde em um só sistema.",
}

let cachedProfile: ProfileData | null = null

export function loadProfileData(): ProfileData {
  try {
    return {
      ...DEFAULT_PROFILE,
      ...JSON.parse(localStorage.getItem(PROFILE_KEY) ?? "{}"),
    }
  } catch {
    return DEFAULT_PROFILE
  }
}

export function saveProfileData(profile: ProfileData): void {
  cachedProfile = { ...DEFAULT_PROFILE, ...profile }
  localStorage.setItem(PROFILE_KEY, JSON.stringify(cachedProfile))
  window.dispatchEvent(new Event(PROFILE_EVENT))
}

function getSnapshot(): ProfileData {
  if (!cachedProfile) cachedProfile = loadProfileData()
  return cachedProfile
}

function subscribe(listener: () => void): () => void {
  const sync = (event: Event) => {
    if (event instanceof StorageEvent && event.key !== PROFILE_KEY) return
    cachedProfile = loadProfileData()
    listener()
  }
  window.addEventListener(PROFILE_EVENT, sync)
  window.addEventListener("storage", sync)
  return () => {
    window.removeEventListener(PROFILE_EVENT, sync)
    window.removeEventListener("storage", sync)
  }
}

export function useProfileData(): ProfileData {
  return useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_PROFILE)
}
