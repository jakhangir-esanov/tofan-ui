export interface TrainerResponse {
  id: string;
  userId: string;
  displayName: string;
  bio: string | null;
  photoFileId: string | null;
  monthlyPrice: number;
  isPublished: boolean;
  createdOnUtc: string;
}

export interface CreateTrainerRequest {
  userId: string;
  displayName: string;
}
