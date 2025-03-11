import mongoose, { Model } from 'mongoose';
import answerSchema from './schema/answer.schema';
import { DatabaseNotification } from '../types/types';
import notificationSchema from './schema/notification.schema';

/**
 * Mongoose model for the `Answer` collection.
 *
 * This model is created using the `Answer` interface and the `answerSchema`, representing the
 * `Answer` collection in the MongoDB database, and provides an interface for interacting with
 * the stored answers.
 *
 * @type {Model<DatabaseAnswer>}
 */
const NotificationModel: Model<DatabaseNotification> = mongoose.model<DatabaseNotification>(
  'Notification',
  notificationSchema,
);

export default NotificationModel;
