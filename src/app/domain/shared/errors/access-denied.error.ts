import { DomainError } from './domain.error';

export class AccessDeniedError extends DomainError {
  constructor() {
    super('The current user is not allowed to perform this action.');
  }
}
