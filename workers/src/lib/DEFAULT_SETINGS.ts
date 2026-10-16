 export interface PreferenceSettings {
    darkMode: boolean;
    soundEffects: boolean;
    hapticFeedback: boolean;
    language: "English" | "Urdu" | "Hindi" | "Arabic" | "Spanish";
}

export interface NotificationSettings {
    dailyTraining: boolean;
    streakReminder: boolean;
    rivalChallenges: boolean;
    squadMessages: boolean;
    weeklyProgress: boolean;
}

export interface PrivacySettings {
    leaderboardVisibility: "Public" | "Friends" | "Private";
    activityFeedPublic: boolean;
    streakPublic: boolean;
}

export interface Settings {
    preferences: PreferenceSettings;
    notifications: NotificationSettings;
    privacy: PrivacySettings;
}

export const DEFAULT_SETTINGS: Settings = {
    preferences: {
        darkMode: true,
        soundEffects: true,
        hapticFeedback: false,
        language: "English",
    },
    notifications: {
        dailyTraining: true,
        streakReminder: true,
        rivalChallenges: true,
        squadMessages: false,
        weeklyProgress: true,
    },
    privacy: {
        leaderboardVisibility: "Public",
        activityFeedPublic: true,
        streakPublic: false,
    },
};

/* ── Deep merge stored settings over defaults ─────────────
   Guarantees every field exists, even if the DB has {}.
   ========================================================= */
export function resolveSettings(stored: unknown): Settings {
    if (!stored || typeof stored !== "object") return clone(DEFAULT_SETTINGS);

    const s = stored as Partial<Settings>;

    return {
        preferences: {
            ...DEFAULT_SETTINGS.preferences,
            ...(s.preferences ?? {}),
        },
        notifications: {
            ...DEFAULT_SETTINGS.notifications,
            ...(s.notifications ?? {}),
        },
        privacy: {
            ...DEFAULT_SETTINGS.privacy,
            ...(s.privacy ?? {}),
        },
    };
}

/* ── Shallow-clone defaults so callers can't mutate the source ── */
function clone(s: Settings): Settings {
    return {
        preferences: { ...s.preferences },
        notifications: { ...s.notifications },
        privacy: { ...s.privacy },
    };
}
