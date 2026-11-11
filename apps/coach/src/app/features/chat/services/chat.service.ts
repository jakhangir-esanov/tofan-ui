import { Injectable, inject } from '@angular/core';
import { ApiClient } from '@core/http/api-client';
import { Conversation, Message } from '../models/chat';
import {
  ConversationMessagesResponse,
  ConversationResponse,
  MessageResponse,
  OpenConversationResponse,
  SendMessageRequest,
} from './chat.dto';
import { toConversation, toMessage } from './chat.mapper';

const CHAT = '/chat/conversations';

export interface MessagesPage {
  readonly messages: readonly Message[];
  readonly otherReadUpTo: Date | null;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly api = inject(ApiClient);
  private readonly apiUrl = (path: string): string => this.api.url(path);

  async conversations(): Promise<Conversation[]> {
    const responses = await this.api.get<ConversationResponse[]>(CHAT);
    return responses.map((response) => toConversation(response, this.apiUrl));
  }

  open(userId: string): Promise<OpenConversationResponse> {
    return this.api.post<OpenConversationResponse>(`${CHAT}/with/${encodeURIComponent(userId)}`);
  }

  async messages(conversationId: string, limit: number, before?: Date): Promise<MessagesPage> {
    const response = await this.api.get<ConversationMessagesResponse>(
      `${CHAT}/${encodeURIComponent(conversationId)}/messages`,
      {
        Limit: limit,
        Before: before?.toISOString(),
      },
    );
    return {
      messages: (response.messages ?? []).map((message) => toMessage(message, this.apiUrl)),
      otherReadUpTo:
        response.otherReadUpToUtc === null ? null : new Date(response.otherReadUpToUtc),
    };
  }

  async send(
    conversationId: string,
    text: string,
    attachments: readonly string[] = [],
  ): Promise<Message> {
    const request: SendMessageRequest = { text, attachments: [...attachments] };
    return toMessage(
      await this.api.post<MessageResponse>(
        `${CHAT}/${encodeURIComponent(conversationId)}/messages`,
        request,
      ),
      this.apiUrl,
    );
  }

  async delete(conversationId: string, messageId: string): Promise<void> {
    await this.api.delete(
      `${CHAT}/${encodeURIComponent(conversationId)}/messages/${encodeURIComponent(messageId)}`,
    );
  }

  async markRead(conversationId: string): Promise<void> {
    await this.api.post(`${CHAT}/${encodeURIComponent(conversationId)}/read`);
  }
}
