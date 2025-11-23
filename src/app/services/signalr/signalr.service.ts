// src/app/services/signalr.service.ts
import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { MessageDetailDto } from '../chat/chat.service';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private hubConnection: signalR.HubConnection | undefined;
  
  // Observable để gửi tin nhắn mới đến các Component
  public messageReceived = new Subject<MessageDetailDto>();
  
  // Observable để thông báo cần cập nhật danh sách chat (unread count, last message)
  public chatListUpdated = new Subject<void>();

  // **Cần thay thế URL bằng địa chỉ API Backend của bạn**
  private hubUrl: string = 'https://localhost:7001/chathub'; 
  
  constructor() { }

  public startConnection = (token: string) => {
    // Xây dựng kết nối, đính kèm JWT Token vào Query String
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        accessTokenFactory: () => token // Truyền Token cho xác thực
      })
      .configureLogging(signalR.LogLevel.Information)
      .withAutomaticReconnect() // Tự động kết nối lại khi mất mạng
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('SignalR Connection started'))
      .catch(err => console.error('Error while starting connection: ' + err));
  }

  public stopConnection = () => {
    this.hubConnection?.stop();
  }

  public addTransferDataListeners = () => {
    // 1. Lắng nghe event "ReceiveMessage" (Gửi từ ChatController.SendMessage)
    this.hubConnection?.on('ReceiveMessage', (message: MessageDetailDto) => {
      console.log('Tin nhắn mới nhận được:', message);
      this.messageReceived.next(message); // Đẩy tin nhắn vào Observable
    });

    // 2. Lắng nghe event "UpdateChatList" (Gửi từ ChatController.SendMessage)
    this.hubConnection?.on('UpdateChatList', () => {
      console.log('Yêu cầu cập nhật danh sách chat.');
      this.chatListUpdated.next(); // Thông báo cho Component cột trái cập nhật
    });
  }
}