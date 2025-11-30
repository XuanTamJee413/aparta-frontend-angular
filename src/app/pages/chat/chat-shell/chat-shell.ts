import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, InteractionListDto, MessageDetailDto, PartnerDto, SendMessageDto, CreateAdHocInteractionDto } from '../../../services/chat/chat.service';
import { AuthService } from '../../../services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-chat-shell',
  templateUrl: './chat-shell.html',
  styleUrls: ['./chat-shell.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSnackBarModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class ChatShellComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  interactionList: InteractionListDto[] = [];
  selectedInteraction: InteractionListDto | null = null;
  messages: MessageDetailDto[] = [];
  newMessageContent: string = '';

  currentPage: number = 1;
  hasMoreMessages: boolean = true;
  isLoadingMessages: boolean = false;
  isLoadingList: boolean = false;
  isSending: boolean = false;

  private subscriptions: Subscription = new Subscription();
  private snackBar = inject(MatSnackBar); // Inject MatSnackBar

  currentUserId: string | undefined = undefined;
  currentUserRole: string | undefined = undefined;

  partnersToChat: PartnerDto[] = [];
  currentBuildingId: string | null = null;
  selectedPartnerId: string | null = null;

  constructor(
    private chatService: ChatService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const user = this.authService.user();
    const token = this.authService.getToken();

    if (!user || !this.authService.isAuthenticated() || !token) {
      console.error('Người dùng chưa đăng nhập hoặc token không hợp lệ.');
      return;
    }

    this.currentUserId = user.id;
    this.currentUserRole = user.role?.toString();

    this.loadPartners();

    this.chatService.startConnection(token);
    this.subscribeToRealTimeEvents();

    this.checkUserRoleAndLoadChat();
  }

  loadPartners(): void {
    this.chatService.searchPartners().subscribe({
      next: (partners) => {
        this.partnersToChat = partners.filter(p => p.userId !== this.currentUserId);
      },
      error: (err) => console.error('Lỗi tải danh sách đối tác:', err)
    });
  }

  onPartnerSelect(partnerId: string | null): void {
    if (!partnerId || !this.currentUserId) return;

    const existingInteraction = this.interactionList.find(i => i.partnerId === partnerId);

    if (existingInteraction) {
      this.selectInteraction(existingInteraction);
      this.selectedPartnerId = null;
      // SNACKBAR: Thông báo đã có sẵn
      this.snackBar.open('Cuộc hội thoại đã có sẵn.', 'Đóng', { duration: 2000 });
    } else {
      const createDto: CreateAdHocInteractionDto = { partnerId: partnerId };

      this.chatService.createAdHocInteraction(createDto).subscribe({
        next: (result) => {
          this.selectedPartnerId = null;
          this.loadInteractionList(result.interactionId);
          // SNACKBAR: Thông báo tạo mới thành công
          this.snackBar.open(`Đã tạo chat mới với ${result.partnerName}!`, 'Đóng', { duration: 3000 });
        },
        error: (err) => {
          this.selectedPartnerId = null;
          const errorMessage = err.error?.Message || 'Lỗi không xác định.';
          console.error('Lỗi tạo chat Ad-hoc:', errorMessage, err);
          this.snackBar.open(`Lỗi tạo chat: ${errorMessage}`, 'Đóng', { duration: 5000 });
        }
      });
    }
  }

  checkUserRoleAndLoadChat(): void {
    this.isLoadingList = true;
    const isStaffOrAdmin = this.authService.hasRole(['staff', 'admin', 'custom']);

    if (isStaffOrAdmin) {
      this.loadInteractionList();
    } else {
      this.initiateResidentChat();
    }
  }

  initiateResidentChat(): void {
    this.loadInteractionList();
  }

  // src/app/pages/chat/chat-shell/chat-shell.component.ts

  loadInteractionList(selectId?: string): void {
    this.chatService.getInteractionList().subscribe(list => {
      this.interactionList = list;
      this.isLoadingList = false;

      const currentlyOpenId = this.selectedInteraction?.interactionId;
      if (list.length > 0 && !currentlyOpenId && !selectId) {
        this.selectInteraction(list[0]);
        return;
      }

      if (selectId && !currentlyOpenId) {
        const defaultInteraction = list.find(i => i.interactionId === selectId);
        if (defaultInteraction) {
          this.selectInteraction(defaultInteraction);
        }
      }

      if (currentlyOpenId) {
        const updatedInteraction = list.find(i => i.interactionId === currentlyOpenId);

        if (updatedInteraction && updatedInteraction.unreadCount > 0 && updatedInteraction.partnerId !== this.currentUserId) {
          this.selectInteraction(updatedInteraction);
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
        this.isLoadingMessages = false;

        if (newMessages.length > 0) {
          this.messages = [...newMessages, ...this.messages];
        }

        if (newMessages.length < 10) {
          this.hasMoreMessages = false;
        } else {
          this.currentPage++;
        }

        if (shouldScrollToBottom) {
          this.scrollToBottom();
        } else if (container && this.currentPage > 1) {
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
    if (!this.selectedInteraction || !content.trim() || !this.currentUserId || this.isSending) return;

    this.isSending = true;
    const payload: SendMessageDto = {
      interactionId: this.selectedInteraction.interactionId,
      content: content.trim()
    };

    this.chatService.sendMessage(payload).subscribe({
      next: (sentMessage) => {
        this.isSending = false;
        this.messages = [...this.messages, sentMessage];
        this.newMessageContent = '';
        this.scrollToBottom();
        this.loadInteractionList();
      },
      error: (err) => {
        // 5. TẮT CỜ KHI CÓ LỖI (quan trọng, nếu không sẽ bị kẹt vĩnh viễn)
        this.isSending = false;
        console.error('[API ERROR] sendMessage thất bại:', err);
      }
    });
  }

  onScroll(event: Event): void {
    const element = event.target as HTMLElement;
    if (element.scrollTop === 0 && this.hasMoreMessages && !this.isLoadingMessages) {
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
      if (this.selectedInteraction?.interactionId === message.interactionId) {
        this.messages = [...this.messages, message];
        this.scrollToBottom();
      }
      this.loadInteractionList();
    }));

    this.subscriptions.add(this.chatService.chatListUpdated.subscribe(() => {
      this.loadInteractionList();
    }));
  }

  ngOnDestroy(): void {
    this.chatService.stopConnection();
    this.subscriptions.unsubscribe();
  }

  truncateMessage(value: string | null | undefined, limit: number = 40, trail: string = '...'): string {
    if (!value) {
      return '';
    }

    const trimmedValue = value.trim();

    if (trimmedValue.length > limit) {
      // Cắt ngắn và thêm dấu ba chấm
      return trimmedValue.substring(0, limit) + trail;
    }

    return trimmedValue;
  }
}