// src/app/services/chat.service.ts (Đã tối ưu và gộp)

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import * as signalR from '@microsoft/signalr';

export interface InitiateInteractionDto {
    interactionId: string;
    partnerId: string;
    partnerName: string;
}

export interface InteractionListDto {
    interactionId: string;
    partnerId: string;
    partnerName: string;
    partnerAvatarUrl: string | null;
    lastMessageContent: string | null;
    lastMessageSentAt: Date | null;
    unreadCount: number;
}

export interface MessageDetailDto {
    messageId: string;
    senderId: string;
    content: string;
    sentAt: Date;
    isRead: boolean;
    // Bổ sung: để phân biệt tin nhắn đến từ SignalR có đúng interaction không
    interactionId: string; 
}

export interface SendMessageDto {
    interactionId: string;
    content: string;
}

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    // Sử dụng đường dẫn tương đối hoặc base URL từ environment
    private readonly apiUrl = '/api/Chat'; 
    private hubConnection: signalR.HubConnection | undefined;
    
    private hubUrl: string = 'http://localhost:5175/chathub'; 
    
    public messageReceived = new Subject<MessageDetailDto>();
    public chatListUpdated = new Subject<void>();

    constructor(private http: HttpClient) { }

    // ================== REAL-TIME (SignalR) ==================

    public startConnection = (token: string) => {
        if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
            return;
        }

        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(this.hubUrl, {
                accessTokenFactory: () => token 
            })
            .withAutomaticReconnect() 
            .build();

        this.hubConnection
            .start()
            .then(() => {
                this.addTransferDataListeners();
            })
            .catch(err => console.error('Error while starting SignalR connection: ' + err));
    }

    public stopConnection = () => {
        this.hubConnection?.stop();
    }

    private addTransferDataListeners = () => {
        this.hubConnection?.on('ReceiveMessage', (message: MessageDetailDto) => {
            this.messageReceived.next(message); 
        });

        this.hubConnection?.on('UpdateChatList', () => {
            this.chatListUpdated.next(); 
        });
    }

    // ================== REST API CALLS ==================

    initiateInteraction(): Observable<InitiateInteractionDto> {
        return this.http.post<InitiateInteractionDto>(`${this.apiUrl}/initiate-interaction`, {});
    }

    getInteractionList(): Observable<InteractionListDto[]> {
        return this.http.get<InteractionListDto[]>(`${this.apiUrl}/interactions`);
    }

    getMessages(
        interactionId: string, 
        pageNumber: number = 1, 
        pageSize: number = 10
    ): Observable<MessageDetailDto[]> {
        
        let params = new HttpParams()
            .set('pageNumber', pageNumber.toString())
            .set('pageSize', pageSize.toString());
            
        return this.http.get<MessageDetailDto[]>(
            `${this.apiUrl}/interactions/${interactionId}/messages`, 
            { params }
        );
    }

    sendMessage(messagePayload: SendMessageDto): Observable<MessageDetailDto> {
        return this.http.post<MessageDetailDto>(`${this.apiUrl}/messages`, messagePayload);
    }
}