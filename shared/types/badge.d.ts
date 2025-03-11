import { ObjectId } from 'mongodb';
import { Request } from 'express';

type BadgeType = 'question' | 'answer' | 'comment' | 'nim';

export interface Badge {
  name: string;
  description: string;
  type: BadgeType;
  threshold: number;
  imagePath: string;
}

export interface DatabaseBadge extends Badge {
  _id: ObjectId;
}

/**
 * Represents the response for a single badge.
 * Can either be a valid DatabaseBadge object or an error message.
 */
export type BadgeResponse = DatabaseBadge | { error: string };

/**
 * Represents the response for multiple badges.
 * Can either be an array of DatabaseBadge objects or an error message.
 */
export type BadgesResponse = DatabaseBadge[] | { error: string };

/**
 * Represents a request containing a badge in the body.
 * Extends the Express Request object to include a body of type Badge.
 */
export interface BadgeRequest extends Request {
  body: Badge;
}
