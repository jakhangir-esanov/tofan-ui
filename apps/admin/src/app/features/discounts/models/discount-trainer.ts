export const DISCOUNT_TRAINERS_LIMIT = 100;

export interface DiscountTrainer {
  readonly id: string;
  readonly displayName: string;
}

export function trainerNamesOf(
  trainerIds: readonly string[],
  trainers: readonly DiscountTrainer[],
): readonly string[] {
  return trainerIds.map((id) => trainers.find((trainer) => trainer.id === id)?.displayName ?? id);
}
