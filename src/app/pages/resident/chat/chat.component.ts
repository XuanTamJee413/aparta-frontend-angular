import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface ChatMessage {
  text: string;
  time: string;
  sender: 'staff' | 'user';
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1>Chat with Staff</h1>
        <p class="subtitle">Get instant support from our building team</p>
      </header>

      <div class="chat-window">
        <!-- HEADER CỦA CỬA SỔ CHAT -->
        <header class="chat-header">
          <div class="avatar">BM</div>
          <div class="recipient-info">
            <strong>Building Management</strong>
            <span class="status-online">Online</span>
          </div>
        </header>

        <!-- KHU VỰC HIỂN THỊ TIN NHẮN -->
        <main class="message-list">
          @for(message of messages; track $index) {
            <div class="message" [ngClass]="{ 'user-message': message.sender === 'user', 'staff-message': message.sender === 'staff' }">
              <div class="message-bubble">
                <p class="message-content">{{ message.text }}</p>
                <span class="message-time">{{ message.time }}</span>
              </div>
            </div>
          }
        </main>

        <!-- KHU VỰC NHẬP TIN NHẮN -->
        <footer class="chat-input-area">
          <input type="text" placeholder="Type your message here...">
          <button class="btn btn-primary">Send</button>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .page-container {
      max-width: 900px; 
      margin: 0 auto;
    }
    .page-header h1 {
      font-size: 1.75rem;
      font-weight: 600;
      color: #333;
      margin: 0;
    }
    .subtitle {
      color: #6c757d;
      margin: 0.25rem 0 0 0;
    }
    .btn {
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      font-size: 1rem;
    }
    .btn-primary {
      background-color: #0d6efd;
      color: #fff;
    }

    .chat-window {
      background-color: #fff;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      margin-top: 2rem;
      display: flex;
      flex-direction: column;
      height: 70vh;
    }
    .chat-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.5rem;
      background-color: #0d6efd;
      color: #fff;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
    }
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      flex-shrink: 0;
    }
    .recipient-info strong { font-weight: 600; }
    .status-online {
      display: block;
      font-size: 0.8rem;
      opacity: 0.8;
    }
    .status-online::before {
      content: '';
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #198754;
      margin-right: 0.5rem;
    }

    .message-list {
      flex-grow: 1;
      padding: 1.5rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .message {
      display: flex;
      max-width: 70%;
    }
    .message-bubble {
      padding: 0.75rem 1rem;
      border-radius: 18px;
    }
    .message-content {
      margin: 0;
      line-height: 1.5;
    }
    .message-time {
      display: block;
      font-size: 0.75rem;
      text-align: right;
      margin-top: 0.25rem;
      opacity: 0.8;
    }

    .staff-message {
      align-self: flex-start;
    }
    .staff-message .message-bubble {
      background-color: #f1f3f5;
      color: #333;
      border-bottom-left-radius: 4px;
    }

    .user-message {
      align-self: flex-end;
    }
    .user-message .message-bubble {
      background-color: #0d6efd;
      color: #fff;
      border-bottom-right-radius: 4px;
    }
    .user-message .message-time {
      color: rgba(255, 255, 255, 0.8);
    }
    
    .chat-input-area {
      display: flex;
      padding: 1rem;
      border-top: 1px solid #e9ecef;
    }
    .chat-input-area input {
      flex-grow: 1;
      border: 1px solid #ced4da;
      border-radius: 6px;
      padding: 0.75rem 1rem;
      font-size: 1rem;
      margin-right: 1rem;
    }
  `]
})
export class ChatComponent {
  messages: ChatMessage[] = [
    { text: 'Hello! Welcome to MyBuilding support. How can I help you today?', time: '10:30 AM', sender: 'staff' },
    { text: 'Hi! I wanted to ask about the pool maintenance schedule.', time: '10:32 AM', sender: 'user' },
    { text: 'The swimming pool will be closed for maintenance on October 20-21, 2025. It will reopen on October 22nd at 6:00 AM.', time: '10:33 AM', sender: 'staff' },
    { text: 'Thank you! Also, is there a way to book the BBQ area for this weekend?', time: '10:35 AM', sender: 'user' },
    { text: 'Absolutely! You can book the BBQ area through the Facilities page in your portal. Would you like me to guide you through the process?', time: '10:36 AM', sender: 'staff' },
    { text: 'No worries, I found it. Thanks for your help!', time: '10:37 AM', sender: 'user' },
  ];
}
