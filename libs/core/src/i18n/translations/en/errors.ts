import { Dictionary } from '../../dictionary';

export const ERRORS_EN: Dictionary['errors'] = {
  backend: {
    Authentication: {
      InvalidCredentials: 'Wrong username or password.',
      InvalidRefreshToken: 'Your session has expired. Please sign in again.',
    },
    IdentityProvider: {
      UserNotFound: 'User not found.',
    },
    Chat: {
      ConversationNotFound: 'Conversation not found. Refresh the chat list.',
      MessageNotFound: 'Message not found. It may already be deleted.',
      SubscriptionRequired: 'Chat is open only to athletes with an active VIP subscription.',
    },
    NotificationTemplate: {
      Conflict: 'An active template already exists for this type and style. Deactivate it first.',
      NoActiveTemplate: "No active template matches this type and the user's style.",
    },
    NotificationPreference: {
      Disabled: 'The user has turned off notifications of this type.',
    },
    PushNotification: {
      NoActiveDevice: 'The user has no active device that accepts push.',
      DispatchFailed: 'The push service could not deliver the notification.',
      Disabled: 'Push notifications are turned off in this environment.',
      ConfigurationInvalid:
        'The push service is not configured (Firebase keys are missing). Contact an administrator.',
    },
    UserId: {
      Empty: 'User ID is required.',
      Invalid: 'User ID must be a UUID.',
    },
    Data: {
      KeyEmpty: 'Every value in the extra data needs a key.',
      KeyDuplicate: 'Keys in the extra data must be unique.',
    },
    StoredFile: {
      InUse: 'The file is used as an exercise video. Detach it from the exercise first.',
      NotFound: 'File not found — it may have been deleted already.',
      Empty: 'The selected file is empty.',
      UnsupportedContent: 'This file type is not accepted for the selected category.',
      TooLarge: 'The file is larger than this category allows.',
    },
    Exercise: {
      VideoAlreadyAttached:
        'Another video is already attached to this exercise. The uploaded file was deleted — refresh the list.',
    },
    User: {
      NotFound: 'Account not found — it may have been deleted from Keycloak.',
      AlreadyBlocked: 'The account is already blocked.',
      NotBlocked: 'The account is not blocked.',
      CannotBlockSelf: 'You cannot block your own account.',
      InvalidUsername: 'The username may contain only Latin letters, digits and . _ - @',
    },
    Garment: {
      NotFound: 'Shirt not found — it may have been deleted.',
      ManufacturedInFuture: 'The manufacturing date cannot be in the future.',
      NotClaimed: 'Only an activated shirt can be extended.',
      CannotDeleteClaimed: 'An activated shirt cannot be deleted. Revoke it instead.',
      StatusNotAllowed: 'A shirt can only be set to active, hidden or revoked.',
      MonthsOutOfRange: 'The period must be between 1 and 24 months.',
    },
    Trainer: {
      PriceNotSet:
        'The trainer has not set a price yet. The trainer must enter it in their profile first.',
      NotFound: 'Trainer not found.',
      DisplayNameEmpty: 'The trainer name is required.',
    },
    TrainerSubscription: {
      OtherTrainerActive:
        'The user already has an active subscription to another trainer — end it first.',
      MonthsOutOfRange: 'The subscription length must be between 1 and 12 months.',
      NotFound: 'The subscription was not found. Refresh the list and try again.',
      NotActive: 'The subscription is not active, so its Tier cannot be changed.',
    },
    WorkoutPlan: {
      TrainerProgramMissing: 'The trainer has not published a workout program yet.',
    },
    MealPlan: {
      TrainerProgramMissing: 'The trainer has not published a meal program yet.',
    },
    TrainerPost: {
      NotFound: 'Post not found. Refresh the list and try again.',
    },
    TrainerVideoCollection: {
      NotFound: 'Collection not found. Refresh the list and try again.',
      VideoNotFound: 'Video not found. Refresh the page and try again.',
      Empty: 'Add at least one video to publish the collection.',
      LimitReached: 'That’s 20 collections - delete one to make another.',
      VideoLimitReached: 'That’s 50 videos - remove one to add another.',
      OrderMismatch: 'The order is out of date. Refresh the page and try again.',
      VideoOrderMismatch: 'The video order is out of date. Refresh the page and try again.',
    },
    Tariff: {
      FreeMustStayFree: 'The Free tariff must always stay free. Keep the price at 0.',
      PaidPriceRequired: 'The price of Standard and VIP tariffs must be above 0.',
      NotFound: 'Tariff not found.',
    },
    GetUsersQuery:
      'Could not read accounts from Keycloak. If a role filter is selected, it may not work yet (Keycloak needs configuring).',
  },
  classes: {
    network: 'Could not reach the server. Please try again later.',
    invalidCredentials: 'Wrong username or password.',
    sessionExpired: 'Your session has expired. Please sign in again.',
    accessDenied: 'You do not have permission for this action.',
    notFound: 'Not found — it may have been deleted.',
    conflict: 'This record already exists.',
    validationFallback: 'Some fields are filled in incorrectly.',
    generic: 'The action failed. Please try again later.',
  },
};
