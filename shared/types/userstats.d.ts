/**
 * Represents a user statistics object
 * - username: Reference to the associated user.
 * - questionsCount: Number of questions posted by the user.
 * - commentsCount: Number of comments made by the user.
 * - answersCount: Number of answers provided by the user.
 * - nimWinCount: Number of Nim game wins achieved by the user.
 */
export interface UserStats {
  username: string; // Reference to the associated user.
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
