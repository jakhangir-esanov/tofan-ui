import { DomainError } from '@domain/shared/errors/domain.error';

export class SessionExpiredError extends DomainError {
  constructor() {
    super('The session can no longer be renewed.');
  }
}
