/**
 * One (day, category) learning-time row from aclearningutil's /api/UserLearningTimes
 * (POST heartbeat echo / GET row). learningSeconds is the server-credited cumulative
 * total for that user/day/category — a 60-second client heartbeat can only ever add
 * the seconds the server saw elapse since the previous accepted beat, so the number
 * is not forgeable by the client.
 */
export interface UserLearningTime {
  /** Server-local calendar day, 'yyyy-MM-dd'. */
  learnDate: string;
  /** LearningContentCategory id (1-6). */
  categoryId: number;
  /** Cumulative credited seconds for user/day/category. */
  learningSeconds: number;
  /** ISO UTC instant of the most recently accepted heartbeat. */
  lastBeatAt: string;
}

/** The caller's leaderboard visibility choice (GET/PUT …/Preferences). */
export interface LearningTimePreferences {
  /** True = hide my totals from the Top Learners list (statistics keep accruing). */
  leaderboardOptOut: boolean;
}

/** One ranked entry of GET /api/UserLearningTimes/Leaderboard. */
export interface LearningTimeLeaderboardEntry {
  /** The JWT user id behind the totals. */
  userId: string;
  /** Stored display name, or a short id prefix for senders that never sent one. */
  userName: string;
  /** Sum of credited seconds over the requested window. */
  totalSeconds: number;
}
