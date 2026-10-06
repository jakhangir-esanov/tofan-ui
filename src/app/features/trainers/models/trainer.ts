const MAX_INITIALS = 2;

export type TrainerPublishState = 'published' | 'draft';

export class Trainer {
  constructor(
    readonly id: string,
    readonly userId: string,
    readonly displayName: string,
    readonly bio: string | null,
    readonly photoUrl: string | null,
    readonly monthlyPrice: number,
    readonly isPublished: boolean,
    readonly createdOn: Date,
  ) {}

  publishState(): TrainerPublishState {
    return this.isPublished ? 'published' : 'draft';
  }

  hasPrice(): boolean {
    return this.monthlyPrice > 0;
  }

  initials(): string {
    return this.displayName
      .split(/\s+/)
      .filter((word) => word.length > 0)
      .slice(0, MAX_INITIALS)
      .map((word) => word.charAt(0).toUpperCase())
      .join('');
  }
}
