// src/app/services/chat.service.ts (Đã tối ưu và gộp)

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import * as signalR from '@microsoft/signalr';

export interface ApiResponse<T> {
    succeeded: boolean;
    message: string;
    data: T;
}

export interface PagedList<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
}
export interface PartnerDto {
    userId: string;
    fullName: string;
    avatarUrl: string | null;
    role: string;
    apartmentCode?: string;
}
export interface InitiateInteractionDto {
    interactionId: string;
    partnerId: string;
    partnerName: string;
}
export interface CreateAdHocInteractionDto {
    partnerId: string;
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
    /**
     * GET: Tìm kiếm Staff hoặc Resident dựa trên Building ID.
     * @param buildingId ID của tòa nhà liên quan đến người dùng hiện tại.
     */
    searchPartners(): Observable<PartnerDto[]> {
        return this.http.get<PartnerDto[]>(`${this.apiUrl}/search-partners`);
    }
    createAdHocInteraction(dto: CreateAdHocInteractionDto): Observable<InitiateInteractionDto> { // <--- BỔ SUNG
        return this.http.post<InitiateInteractionDto>(`${this.apiUrl}/create-interaction`, dto);
    }

    getInteractionList(): Observable<InteractionListDto[]> {
        return this.http.get<InteractionListDto[]>(`${this.apiUrl}/interactions`);
    }

    getMessages(
        interactionId: string,
        pageNumber: number = 1,
        pageSize: number = 10
    ): Observable<ApiResponse<PagedList<MessageDetailDto>>> { // <--- Đổi kiểu trả về

        let params = new HttpParams()
            .set('pageNumber', pageNumber.toString())
            .set('pageSize', pageSize.toString());

        return this.http.get<ApiResponse<PagedList<MessageDetailDto>>>( // <--- Đổi kiểu generic
            `${this.apiUrl}/interactions/${interactionId}/messages`,
            { params }
        );
    }

    sendMessage(messagePayload: SendMessageDto): Observable<MessageDetailDto> {
        return this.http.post<MessageDetailDto>(`${this.apiUrl}/messages`, messagePayload);
    }
}