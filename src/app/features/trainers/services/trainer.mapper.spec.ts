import { toCreateTrainerRequest, toTrainer } from './trainer.mapper';
import { TrainerResponse } from './trainer.dto';

const response: TrainerResponse = {
  id: 't1',
  userId: 'u1',
  displayName: 'Jasur Karimov',
  bio: 'Kuch mashqlari',
  photoFileId: 'f1',
  monthlyPrice: 450000,
  isPublished: true,
  createdOnUtc: '2026-10-02T09:00:00Z',
};

const photoUrlOf = (fileId: string): string => `https://api.example/files/${fileId}/content`;

describe('toTrainer', () => {
  it('should map every field when the trainer has a photo and a bio', () => {
    const trainer = toTrainer(response, photoUrlOf);

    expect(trainer.id).toBe('t1');
    expect(trainer.userId).toBe('u1');
    expect(trainer.displayName).toBe('Jasur Karimov');
    expect(trainer.bio).toBe('Kuch mashqlari');
    expect(trainer.photoUrl).toBe('https://api.example/files/f1/content');
    expect(trainer.monthlyPrice).toBe(450000);
    expect(trainer.isPublished).toBe(true);
    expect(trainer.createdOn).toEqual(new Date('2026-10-02T09:00:00Z'));
  });

  it('should leave the photo and the bio empty when the backend sends null', () => {
    const trainer = toTrainer({ ...response, bio: null, photoFileId: null }, photoUrlOf);

    expect(trainer.bio).toBeNull();
    expect(trainer.photoUrl).toBeNull();
  });
});

describe('toCreateTrainerRequest', () => {
  it('should send the user id and the display name when the request is built', () => {
    expect(toCreateTrainerRequest({ userId: 'u1', displayName: 'Jasur' })).toEqual({
      userId: 'u1',
      displayName: 'Jasur',
    });
  });
});
