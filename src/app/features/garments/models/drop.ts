export interface DropVariant {
  readonly id: string;
  readonly name: string;
  readonly color: string;
  readonly imageUrl: string | null;
}

export class Drop {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly totalQuantity: number,
    readonly issuedCount: number,
    readonly createdOnUtc: Date,
    readonly variants: readonly DropVariant[] = [],
  ) {}

  isSoldOut(): boolean {
    return this.issuedCount >= this.totalQuantity;
  }

  remainingEditions(): number {
    return Math.max(this.totalQuantity - this.issuedCount, 0);
  }

  canTakeGarments(): boolean {
    return !this.isSoldOut() && this.variants.length > 0;
  }

  progressPercent(): number {
    return this.totalQuantity === 0 ? 0 : Math.round((this.issuedCount / this.totalQuantity) * 100);
  }

  variant(id: string): DropVariant | null {
    return this.variants.find((variant) => variant.id === id) ?? null;
  }
}
