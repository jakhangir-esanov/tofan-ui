import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LocaleStore } from '@core/i18n/locale.store';
import { PublicTrainer } from '../../models/public-trainer';
import { TrainerPage } from './trainer-page';

const TRAINER: PublicTrainer = {
  slug: 'aziz-karimov',
  displayName: 'Aziz Karimov',
  bio: '8 yillik tajriba',
  photoUrl: null,
  monthlyPrice: 500000,
  averageRating: 4.8,
  reviewCount: 12,
  workoutPrograms: [{ name: 'Super o‘zgarish', goal: 'gainMuscle' }],
  mealPrograms: [],
  videos: [{ id: 'video-1', mp4Url: 'https://api.test/v.mp4', hlsUrl: null, posterUrl: null }],
};

describe('TrainerPage', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  function render(trainer: PublicTrainer | null): HTMLElement {
    const fixture = TestBed.createComponent(TrainerPage);
    fixture.componentRef.setInput('trainer', trainer);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('should show the trainer name, price and programs when the trainer is found', () => {
    const page = render(TRAINER);

    expect(page.querySelector('h1')?.textContent).toContain('Aziz Karimov');
    expect(page.querySelector('.price')?.textContent).toContain('500 000 so‘m / oy');
    expect(page.querySelector('.rating')?.textContent).toContain('4,8 · 12 ta sharh');
    expect(page.textContent).toContain('Super o‘zgarish');
    expect(page.textContent).toContain('Massa olish');
    expect(page.textContent).toContain('Hozircha dastur yo‘q');
    expect(page.querySelectorAll('video')).toHaveLength(1);
  });

  it('should show initials when the trainer has no photo', () => {
    const page = render(TRAINER);

    expect(page.querySelector('.monogram')?.textContent).toContain('AK');
    expect(page.querySelector('.portrait img')).toBeNull();
  });

  it('should show the not found message in the current locale when no trainer is resolved', () => {
    TestBed.inject(LocaleStore).setLocale('ru');

    const page = render(null);

    expect(page.querySelector('h1')?.textContent).toContain('Тренер не найден');
    expect(page.querySelector('a[href="/app"]')).not.toBeNull();
  });
});
