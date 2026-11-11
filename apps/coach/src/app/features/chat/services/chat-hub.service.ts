import { Injectable, inject } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { API_BASE_URL } from '@core/http/api-base-url';
import { AuthSessionStorage } from '@core/auth/auth-session.storage';
import { Message, MessageDeletion, Presence } from '../models/chat';
import {
  ActivityNotice,
  ChatActivity,
  SentActivity,
  shouldSendActivity,
} from '../models/chat-activity';
import {
  ActivityEvent,
  MessageDeletedEvent,
  MessageResponse,
  PresenceEvent,
  ReadEvent,
  chatActivities,
} from './chat.dto';
import { toActivityNotice, toMessage, toMessageDeletion, toPresence } from './chat.mapper';

const HUB_PATH = '/hubs/chat';

export interface ReadNotice {
  readonly conversationId: string;
  readonly readerUserId: string;
  readonly readUpTo: Date | null;
}

@Injectable({ providedIn: 'root' })
export class ChatHub {
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly session = inject(AuthSessionStorage);
  private connection: HubConnection | null = null;
  private readonly lastActivity = new Map<string, SentActivity>();

  readonly messages = new Subject<Message>();
  readonly deletions = new Subject<MessageDeletion>();
  readonly reads = new Subject<ReadNotice>();
  readonly activities = new Subject<ActivityNotice>();
  readonly presence = new Subject<Presence>();
  readonly reconnected = new Subject<void>();

  async start(): Promise<void> {
    if (this.session.get() === null) {
      return;
    }
    const connection = (this.connection ??= this.build());
    if (connection.state !== HubConnectionState.Disconnected) {
      return;
    }
    try {
      await connection.start();
      this.reconnected.next();
    } catch {
      return;
    }
  }

  async stop(): Promise<void> {
    if (this.connection === null || this.connection.state === HubConnectionState.Disconnected) {
      return;
    }
    try {
      await this.connection.stop();
    } catch {
      return;
    }
  }

  activity(conversationId: string, activity: ChatActivity): void {
    if (this.connection?.state !== HubConnectionState.Connected) {
      return;
    }
    const now = Date.now();
    if (!shouldSendActivity(this.lastActivity.get(conversationId), activity, now)) {
      return;
    }
    this.lastActivity.set(conversationId, { activity, at: now });
    this.connection
      .send('Activity', conversationId, chatActivities.toApi(activity))
      .catch(() => undefined);
  }

  private build(): HubConnection {
    const connection = new HubConnectionBuilder()
      .withUrl(`${this.baseUrl}${HUB_PATH}`, {
        accessTokenFactory: () => this.session.get()?.accessToken ?? '',
      })
      .withAutomaticReconnect()
      .build();
    this.listen(connection);
    connection.onreconnected(() => this.reconnected.next());
    return connection;
  }

  private read(payload: ReadEvent): void {
    if (payload.conversationId && payload.readerUserId) {
      this.reads.next({
        conversationId: payload.conversationId,
        readerUserId: payload.readerUserId,
        readUpTo: payload.readUpToUtc ? new Date(payload.readUpToUtc) : null,
      });
    }
  }

  private listen(connection: HubConnection): void {
    connection.on('MessageReceived', (payload: MessageResponse) =>
      this.messages.next(toMessage(payload, (path) => `${this.baseUrl}${path}`)),
    );
    connection.on('MessageDeleted', (payload: MessageDeletedEvent) => {
      const deletion = toMessageDeletion(payload);
      if (deletion !== null) {
        this.deletions.next(deletion);
      }
    });
    connection.on('ConversationRead', (payload: ReadEvent) => this.read(payload));
    connection.on('UserActivity', (payload: ActivityEvent) => {
      const notice = toActivityNotice(payload);
      if (notice !== null) {
        this.activities.next(notice);
      }
    });
    connection.on('UserPresenceChanged', (payload: PresenceEvent) => {
      const presence = toPresence(payload);
      if (presence !== null) {
        this.presence.next(presence);
      }
    });
  }
}
