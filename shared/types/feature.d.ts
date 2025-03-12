// todo
export interface Feature {
  name: FeatureType;
  price: number;
}

export type FeatureType = 'Nim' | 'Custom Photo';

// todo
export interface DatabaseFeature extends Feature {
  _id: mongoose.Types.ObjectId;
}
