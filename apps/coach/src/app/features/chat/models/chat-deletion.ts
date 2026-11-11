import { NotFoundError } from '@shared/models/errors/not-found.error';
import { Message, isMine } from './chat';

export const MESSAGE_NOT_FOUND_CODE = 'Chat.MessageNotFound';

export function canDelete(message: Message, otherUserId: string): boolean {
  return otherUserId !== '' && isMine(message, otherUserId);
}

export function isAlreadyDeleted(error: unknown): boolean {
  return error instanceof NotFoundError && error.code === MESSAGE_NOT_FOUND_CODE;
}
