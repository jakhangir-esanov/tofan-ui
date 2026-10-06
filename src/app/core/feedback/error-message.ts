import { InvalidCredentialsError } from '@core/auth/invalid-credentials.error';
import { SessionExpiredError } from '@core/auth/session-expired.error';
import { TranslationKey } from '@core/i18n/dictionary';
import { AppLocale } from '@core/i18n/locale';
import { TranslatableMessage } from '@core/i18n/translate';
import { AccessDeniedError } from '@shared/models/errors/access-denied.error';
import { BusinessRuleError } from '@shared/models/errors/business-rule.error';
import { ConflictError } from '@shared/models/errors/conflict.error';
import { DomainError } from '@shared/models/errors/domain.error';
import { NotFoundError } from '@shared/models/errors/not-found.error';
import { ServiceUnavailableError } from '@shared/models/errors/service-unavailable.error';
import { ValidationError, ValidationIssue } from '@shared/models/errors/validation.error';
import { LocalizedText } from '@shared/models/localized-text';

export type ErrorMessage = TranslatableMessage;

const ISSUE_SEPARATOR = ' ';

const MESSAGES_BY_CODE: Readonly<Record<string, TranslationKey>> = {
  'Authentication.InvalidCredentials': 'errors.backend.Authentication.InvalidCredentials',
  'Authentication.InvalidRefreshToken': 'errors.backend.Authentication.InvalidRefreshToken',
  'IdentityProvider.UserNotFound': 'errors.backend.IdentityProvider.UserNotFound',
  'NotificationTemplate.Conflict': 'errors.backend.NotificationTemplate.Conflict',
  'NotificationTemplate.NoActiveTemplate': 'errors.backend.NotificationTemplate.NoActiveTemplate',
  'NotificationPreference.Disabled': 'errors.backend.NotificationPreference.Disabled',
  'PushNotification.NoActiveDevice': 'errors.backend.PushNotification.NoActiveDevice',
  'PushNotification.DispatchFailed': 'errors.backend.PushNotification.DispatchFailed',
  'PushNotification.Disabled': 'errors.backend.PushNotification.Disabled',
  'PushNotification.ConfigurationInvalid': 'errors.backend.PushNotification.ConfigurationInvalid',
  'UserId.Empty': 'errors.backend.UserId.Empty',
  'UserId.Invalid': 'errors.backend.UserId.Invalid',
  'Data.KeyEmpty': 'errors.backend.Data.KeyEmpty',
  'Data.KeyDuplicate': 'errors.backend.Data.KeyDuplicate',
  'StoredFile.InUse': 'errors.backend.StoredFile.InUse',
  'StoredFile.NotFound': 'errors.backend.StoredFile.NotFound',
  'StoredFile.Empty': 'errors.backend.StoredFile.Empty',
  'StoredFile.UnsupportedContent': 'errors.backend.StoredFile.UnsupportedContent',
  'StoredFile.TooLarge': 'errors.backend.StoredFile.TooLarge',
  'Exercise.VideoAlreadyAttached': 'errors.backend.Exercise.VideoAlreadyAttached',
  'User.NotFound': 'errors.backend.User.NotFound',
  'User.AlreadyBlocked': 'errors.backend.User.AlreadyBlocked',
  'User.NotBlocked': 'errors.backend.User.NotBlocked',
  'User.CannotBlockSelf': 'errors.backend.User.CannotBlockSelf',
  GetUsersQuery: 'errors.backend.GetUsersQuery',
  'Garment.NotFound': 'errors.backend.Garment.NotFound',
  'Garment.ManufacturedInFuture': 'errors.backend.Garment.ManufacturedInFuture',
  'Garment.NotClaimed': 'errors.backend.Garment.NotClaimed',
  'Garment.CannotDeleteClaimed': 'errors.backend.Garment.CannotDeleteClaimed',
  'Garment.StatusNotAllowed': 'errors.backend.Garment.StatusNotAllowed',
  'Garment.MonthsOutOfRange': 'errors.backend.Garment.MonthsOutOfRange',
  'Trainer.PriceNotSet': 'errors.backend.Trainer.PriceNotSet',
  'Trainer.NotFound': 'errors.backend.Trainer.NotFound',
  'Trainer.DisplayNameEmpty': 'errors.backend.Trainer.DisplayNameEmpty',
  'TrainerSubscription.OtherTrainerActive': 'errors.backend.TrainerSubscription.OtherTrainerActive',
  'TrainerSubscription.MonthsOutOfRange': 'errors.backend.TrainerSubscription.MonthsOutOfRange',
  'WorkoutPlan.TrainerProgramMissing': 'errors.backend.WorkoutPlan.TrainerProgramMissing',
  'MealPlan.TrainerProgramMissing': 'errors.backend.MealPlan.TrainerProgramMissing',
};

export function toErrorMessage(error: unknown): ErrorMessage {
  if (!(error instanceof DomainError)) {
    return 'errors.classes.generic';
  }

  return MESSAGES_BY_CODE[error.code] ?? messageForErrorClass(error);
}

function messageForErrorClass(error: DomainError): ErrorMessage {
  if (error instanceof ValidationError) {
    return validationMessage(error);
  }
  if (error.messages !== undefined) {
    return error.messages;
  }
  if (error instanceof InvalidCredentialsError) {
    return 'errors.classes.invalidCredentials';
  }
  if (error instanceof SessionExpiredError) {
    return 'errors.classes.sessionExpired';
  }
  if (error instanceof AccessDeniedError) {
    return 'errors.classes.accessDenied';
  }
  if (error instanceof NotFoundError) {
    return 'errors.classes.notFound';
  }
  if (error instanceof ConflictError) {
    return 'errors.classes.conflict';
  }
  if (error instanceof ServiceUnavailableError) {
    return 'errors.classes.network';
  }
  if (error instanceof BusinessRuleError && error.message.length > 0) {
    return error.message;
  }
  return 'errors.classes.generic';
}

function validationMessage(error: ValidationError): ErrorMessage {
  if (error.issues.length === 0) {
    return 'errors.classes.validationFallback';
  }
  const known = error.issues.map((issue) => MESSAGES_BY_CODE[issue.code]).find(Boolean);
  return known ?? joinIssues(error.issues);
}

function joinIssues(issues: readonly ValidationIssue[]): ErrorMessage {
  const translated = issues.map((issue) => issue.messages);
  if (!translated.every(isLocalizedText)) {
    return issues.map((issue) => issue.message).join(ISSUE_SEPARATOR);
  }
  const joinIn = (locale: AppLocale): string =>
    translated.map((messages) => messages[locale]).join(ISSUE_SEPARATOR);
  return { en: joinIn('en'), uz: joinIn('uz'), ru: joinIn('ru') };
}

function isLocalizedText(messages: LocalizedText | undefined): messages is LocalizedText {
  return messages !== undefined;
}
