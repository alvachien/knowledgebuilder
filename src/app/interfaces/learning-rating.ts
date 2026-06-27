export interface UserLearningRating {
  id?: number;
  userId?: string;
  contentId: number;
  itemId?: number;
  scoreDate?: string;
  rating: number;
}

export interface LearningContent {
  id: number;
  categoryId: number;
  nameChinese: string;
  nameEnglish: string;
  fileUrl: string;
  createdAt?: string;
  updatedAt?: string;
}
