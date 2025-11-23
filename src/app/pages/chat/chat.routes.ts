// src/app/pages/chat/chat.routes.ts

import { Routes } from '@angular/router';
import { ChatShellComponent } from './chat-shell/chat-shell'; // Đảm bảo đường dẫn đúng

export const CHAT_ROUTES: Routes = [
    {
        path: '',
        component: ChatShellComponent,
        // (Tùy chọn) Thêm guard nếu muốn check riêng cho trang chat
        // canActivate: [authCanActivate, roleCanActivate(['resident', 'staff', 'admin'])],
    }
];