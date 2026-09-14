import { UserProfile } from '@domain/auth/entities/user-profile';
import { SessionRepository } from '@domain/auth/repositories/session.repository';

export class GetCurrentUserUseCase {
  constructor(private readonly sessionRepository: SessionRepository) {}

  execute(): UserProfile | null {
    return this.sessionRepository.get()?.user ?? null;
  }
}
