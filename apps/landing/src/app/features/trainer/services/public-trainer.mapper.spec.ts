import { FitnessGoalDto, PublicTrainerDto } from './public-trainer.dto';
import { toPublicTrainer } from './public-trainer.mapper';

const API = 'https://api.example.test';

function trainerDto(overrides: Partial<PublicTrainerDto> = {}): PublicTrainerDto {
  return {
    id: 'trainer-1',
    slug: 'aziz-karimov',
    displayName: 'Aziz Karimov',
    bio: '  8 yillik tajriba  ',
    photoFileId: 'photo-1',
    monthlyPrice: 299000,
    averageRating: null,
    reviewCount: 0,
    workoutPrograms: [{ name: 'Uy mashg‘uloti', goal: FitnessGoalDto.LoseWeight }],
    mealPrograms: [{ name: ' ', goal: null }],
    previewVideos: [
      {
        id: 'video-2',
        fileId: 'file-2',
        name: null,
        displayOrder: 1,
        videoUrl: '/files/file-2/content',
        hlsUrl: null,
        posterUrl: null,
      },
      {
        id: 'video-1',
        fileId: 'file-1',
        name: null,
        displayOrder: 0,
        videoUrl: '/files/file-1/content',
        hlsUrl: '/streams/file-1/master.m3u8',
        posterUrl: '/streams/file-1/poster.jpg',
      },
    ],
    ...overrides,
  };
}

describe('toPublicTrainer', () => {
  it('should build absolute media urls when the backend returns relative paths', () => {
    const trainer = toPublicTrainer(trainerDto(), API);

    expect(trainer.photoUrl).toBe(`${API}/files/photo-1/content`);
    expect(trainer.videos[0]).toEqual({
      id: 'video-1',
      mp4Url: `${API}/files/file-1/content`,
      hlsUrl: `${API}/streams/file-1/master.m3u8`,
      posterUrl: `${API}/streams/file-1/poster.jpg`,
    });
  });

  it('should order preview videos by display order when they arrive unsorted', () => {
    const trainer = toPublicTrainer(trainerDto(), API);

    expect(trainer.videos.map((video) => video.id)).toEqual(['video-1', 'video-2']);
  });

  it('should map program goals by name and blank names to null when programs are mapped', () => {
    const trainer = toPublicTrainer(trainerDto(), API);

    expect(trainer.workoutPrograms).toEqual([{ name: 'Uy mashg‘uloti', goal: 'loseWeight' }]);
    expect(trainer.mealPrograms).toEqual([{ name: null, goal: null }]);
  });

  it('should trim the bio and leave the photo empty when the trainer has no photo', () => {
    const trainer = toPublicTrainer(trainerDto({ photoFileId: null }), API);

    expect(trainer.bio).toBe('8 yillik tajriba');
    expect(trainer.photoUrl).toBeNull();
  });
});
