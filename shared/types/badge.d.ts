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

// todo javadoc
export type BadgeResponse = DatabaseBadge | { error: string };

// todo javadoc
export type BadgesResponse = DatabaseBadge[] | { error: string };

// todo javadoc
export interface BadgeRequest extends Request {
  body: Badge;
}
