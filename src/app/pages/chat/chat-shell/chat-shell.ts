// src/app/pages/chat/chat-shell/chat-shell.component.ts

import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, InteractionListDto, MessageDetailDto, SendMessageDto } from '../../../services/chat/chat.service'; 
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-chat-shell',
  templateUrl: './chat-shell.html',
  styleUrls: ['./chat-shell.css'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule 
  ]
})
export class ChatShellComponent implements OnInit, OnDestroy {
  // --- ViewChild ---
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  
  // --- Biến Trạng thái ---
  interactionList: InteractionListDto[] = [];
  selectedInteraction: InteractionListDto | null = null;
  messages: MessageDetailDto[] = [];
  newMessageContent: string = ''; 
  
  // Trạng thái cho Load More
  currentPage: number = 1;
  hasMoreMessages: boolean = true;
  isLoadingMessages: boolean = false;
  isLoadingList: boolean = false; 
  
  private subscriptions: Subscription = new Subscription();
  
  // Lấy giá trị động từ AuthService
  currentUserId: string | undefined = undefined; 
  currentUserRole: string | undefined = undefined; 

  constructor(
    private chatService: ChatService, 
    private authService: AuthService 
  ) { }

  ngOnInit(): void {
    // 1. LẤY DỮ LIỆU ĐỘNG TỪ AUTH SERVICE
    const user = this.authService.user(); 
    const token = this.authService.getToken();

    if (!user || !this.authService.isAuthenticated() || !token) {
        console.error('[AUTH] Người dùng chưa đăng nhập hoặc token không hợp lệ.');
        // TODO: Chuyển hướng về trang login
        return; 
    }
    
    this.currentUserId = user.id;
    this.currentUserRole = user.role?.toString();
    
    console.log(`[AUTH] User ID: ${this.currentUserId}, Role: ${this.currentUserRole}`);
    
    // 2. Khởi tạo SignalR và Listeners
    this.chatService.startConnection(token);
    this.subscribeToRealTimeEvents();
    
    // 3. Kiểm tra Role và Khởi tạo/Tải danh sách
    this.checkUserRoleAndLoadChat(); 
  }
  
  // -------------------------------------------------------------
  // --- HÀM KHỞI TẠO VÀ PHÂN QUYỀN (Thay thế initiateChatAndLoadList cũ)
  // -------------------------------------------------------------
  checkUserRoleAndLoadChat(): void {
    this.isLoadingList = true;
    
    // Sử dụng hasRole() để kiểm tra nếu người dùng có vai trò quản lý/staff
    // Các vai trò 'admin' và 'staff' được normalize trong AuthService của bạn.
    const isStaffOrAdmin = this.authService.hasRole(['staff', 'admin', 'custom']);
    
    if (isStaffOrAdmin) {
        // STAFF/ADMIN: Chỉ cần tải danh sách các chat đã tồn tại (Họ không cần Apartment ID)
        console.log('[CHAT] Role Staff/Admin -> Chỉ load danh sách đã tồn tại.');
        this.loadInteractionList(); 
    } else {
        // RESIDENT (hoặc vai trò không quản lý): Cần gọi initiate để tạo/tìm chat
        console.log('[CHAT] Role Resident -> Gọi initiateInteraction để tạo/tìm chat.');
        this.initiateChatAndLoadList();
    }
}

  // Hàm này chỉ gọi khi user là Resident (để tìm Staff phụ trách)
  initiateChatAndLoadList(): void {
    this.chatService.initiateInteraction().subscribe({
        next: (initResult) => {
            console.log(`[API] Initiate thành công. Interaction ID: ${initResult.interactionId}`);
            this.loadInteractionList(initResult.interactionId);
        },
        error: (err) => {
            this.isLoadingList = false;
            const errorMessage = err.error?.Message || 'Lỗi không xác định.';
            console.error('[API ERROR] initiateInteraction thất bại:', errorMessage, err);
        }
    });
  }
  // -------------------------------------------------------------
  // --- LOGIC GIAO DIỆN & API CALLS ---
  // -------------------------------------------------------------

  loadInteractionList(selectId?: string): void {
    console.log('[API] Gọi getInteractionList...');
    this.chatService.getInteractionList().subscribe(list => {
        this.interactionList = list;
        this.isLoadingList = false;
        
        console.log(`[API] Nhận ${list.length} cuộc hội thoại.`);
        
        if (selectId && !this.selectedInteraction) {
            const defaultInteraction = list.find(i => i.interactionId === selectId);
            if (defaultInteraction) {
                console.log(`[CHAT] Tự động chọn chat ID: ${selectId}`);
                this.selectInteraction(defaultInteraction);
            }
        }
    });
  }

  selectInteraction(interaction: InteractionListDto): void {
    this.selectedInteraction = interaction;
    this.messages = []; 
    this.currentPage = 1; 
    this.hasMoreMessages = true; 
    
    this.loadMessages(true);
  }

  loadMessages(shouldScrollToBottom: boolean = false): void {
    if (!this.selectedInteraction || this.isLoadingMessages || !this.hasMoreMessages) {
        return;
    }
    
    this.isLoadingMessages = true;
    
    const container = this.messagesContainer?.nativeElement;
    const oldScrollHeight = container?.scrollHeight || 0;
    
    this.chatService.getMessages(this.selectedInteraction.interactionId, this.currentPage).subscribe({
        next: (newMessages) => {
            console.log(`[API] Load messages thành công (Page ${this.currentPage}). Số lượng: ${newMessages.length}`);
            this.messages = [...newMessages.reverse(), ...this.messages]; 
            this.isLoadingMessages = false;
            
            if (newMessages.length < 10) {
                this.hasMoreMessages = false;
            } else {
                this.currentPage++; 
            }
            
            if (shouldScrollToBottom) {
                this.scrollToBottom();
            } else if (container) {
                const newScrollHeight = container.scrollHeight;
                container.scrollTop = newScrollHeight - oldScrollHeight;
            }
        },
        error: (err) => {
            console.error('[API ERROR] loadMessages thất bại:', err);
            this.isLoadingMessages = false;
        }
    });
  }
  
  sendMessage(content: string): void {
    if (!this.selectedInteraction || !content.trim() || !this.currentUserId) return;

    const payload: SendMessageDto = {
        interactionId: this.selectedInteraction.interactionId,
        content: content.trim()
    };
    
    this.chatService.sendMessage(payload).subscribe({
        next: (sentMessage) => {
            console.log('[API] Tin nhắn gửi đi thành công.', sentMessage);
            this.messages = [...this.messages, sentMessage];
            this.newMessageContent = '';
            this.scrollToBottom();
            
            this.loadInteractionList(); 
        },
        error: (err) => console.error('[API ERROR] sendMessage thất bại:', err)
    });
  }

  // -------------------------------------------------------------
  // --- UTILITY VÀ SCROLL LOGIC ---
  // -------------------------------------------------------------

  onScroll(event: Event): void {
      const element = event.target as HTMLElement;
      if (element.scrollTop < 50 && this.hasMoreMessages && !this.isLoadingMessages) {
          console.log('[SCROLL] Kích hoạt Load More (Page ' + this.currentPage + ')');
          this.loadMessages(false);
      }
  }

  scrollToBottom(delay: number = 50): void {
    setTimeout(() => {
        if (this.messagesContainer) {
            const element = this.messagesContainer.nativeElement;
            element.scrollTop = element.scrollHeight;
        }
    }, delay);
  }
  
  subscribeToRealTimeEvents(): void {
    this.subscriptions.add(this.chatService.messageReceived.subscribe((message: MessageDetailDto) => {
        console.log('[SIGNALR] Nhận tin nhắn real-time.', message);
        if (this.selectedInteraction?.interactionId === message.interactionId) { 
            this.messages = [...this.messages, message];
            this.scrollToBottom();
        }
        
        this.loadInteractionList(); 
    }));
    
    this.subscriptions.add(this.chatService.chatListUpdated.subscribe(() => {
        console.log('[SIGNALR] Yêu cầu cập nhật danh sách chat.');
        this.loadInteractionList(); 
    }));
  }

  ngOnDestroy(): void {
    this.chatService.stopConnection();
    this.subscriptions.unsubscribe();
  }
}