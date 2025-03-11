/**
 * Represents a user statistics object
 * - userId: Reference to the associated user.
 * - questionsCount: Number of questions posted by the user.
 * - commentsCount: Number of comments made by the user.
 * - answersCount: Number of answers provided by the user.
 * - nimWinCount: Number of Nim game wins achieved by the user.
 */
export interface UserStats {
  username: string;
  questionsCount: number;
  commentsCount: number;
  answersCount: number;
  nimWinCount: number;
}

/**
 * Represents a complete user statistics document with an ID.
 */
export interface DatabaseUserStats extends UserStats {
  _id: mongoose.Types.ObjectId;
}

/**
 * Represents the response for user-stats-related operations.
 * - `DatabaseUserStats`: A user stats object if the operation is successful.
 * - `error`: An error message if the operation fails.
 */
export type UserStatsResponse = DatabaseUserStats | { error: string };
