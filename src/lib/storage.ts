const KEYS = {
  DISPLAY_NAME: "pure_p2p_display_name",
  USER_COLOR: "pure_p2p_user_color",
} as const;

export function getStoredDisplayName(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(KEYS.DISPLAY_NAME) || "";
  } catch {
    return "";
  }
}

export function setStoredDisplayName(name: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEYS.DISPLAY_NAME, name.trim());
  } catch (err) {
    console.warn("Failed to save display name to localStorage", err);
  }
}

const AVATAR_COLORS = [
  "from-indigo-500 to-purple-600",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-violet-500 to-fuchsia-600",
];

export function getStoredUserColor(): string {
  if (typeof window === "undefined") return AVATAR_COLORS[0];
  try {
    const existing = localStorage.getItem(KEYS.USER_COLOR);
    if (existing) return existing;
    const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    localStorage.setItem(KEYS.USER_COLOR, randomColor);
    return randomColor;
  } catch {
    return AVATAR_COLORS[0];
  }
}
