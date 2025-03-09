import { ObjectId } from 'mongodb';

export enum BadgeType {
  QUESTION = 'question',
  ANSWER = 'answer',
  COMMENT = 'comment',
  NIM = 'nim',
}

export interface Badge {
  name: string;
  description: string;
  type: BadgeType;
  threshold: number;
  imagePath: string;
}

export interface DatabaseBadge extends Badge {
  _id: mongoose.Types.ObjectId;
}

// todo javadoc
export type BadgeResponse = DatabaseBadge | { error: string };

// todo javadoc
export type BadgesResponse = DatabaseBadge[] | { error: string };

// todo javadoc
export interface BadgeRequest extends Request {
  body: Badge;
}
