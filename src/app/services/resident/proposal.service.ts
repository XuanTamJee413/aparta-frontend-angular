import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { HttpParams } from '@angular/common/http';
// Đảm bảo import environment từ đường dẫn chính xác trong dự án của bạn
import { environment } from '../../../../src/environments/environment';

// --- INTERFACES (DTOs) ---

export interface ProposalDto {
    proposalId: string;
    residentId: string;
    residentName: string;
    operationStaffId: string | null;
    operationStaffName: string | null;
    content: string;
    reply: string | null;
    status: string;
    createdAt: Date | string | null;
    updatedAt: Date | string | null;
}

export interface ProposalCreateDto {
    content: string;
}
export interface ProposalReplyDto {
    replyContent: string;
}

export interface ProposalQueryParams {
    searchTerm?: string;
    status?: string;
    pageNumber: number;
    pageSize: number;
    sortColumn?: string;
    sortDirection?: 'asc' | 'desc';
}
export interface PagedList<T> {
    items: T[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}
// --- SERVICE ---

@Injectable({
    providedIn: 'root'
})
export class ProposalService {
    // SỬA ĐỔI: Sử dụng environment.apiUrl để tạo base URL
    private apiBaseUrl = environment.apiUrl;
    private apiUrl = `${this.apiBaseUrl}/Proposals`;

    private http = inject(HttpClient);

    // 1. TẠO PROPOSAL MỚI (RESIDENT)
    createProposal(dto: ProposalCreateDto): Observable<ProposalDto> {
        return this.http.post<any>(`${this.apiUrl}/create`, dto).pipe(
            map(response => response.data as ProposalDto)
        );
    }

    // 2. LẤY LỊCH SỬ CỦA NGƯỜI DÙNG HIỆN TẠI (RESIDENT)
    getResidentHistory(): Observable<ProposalDto[]> {
        return this.http.get<any>(`${this.apiUrl}/my-history`).pipe(
            map(response => response.data as ProposalDto[])
        );
    }

    // 3. LẤY CHI TIẾT (Dùng chung cho Resident và Staff)
    getProposalDetail(id: string): Observable<ProposalDto> {
        return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
            map(response => response.data as ProposalDto)
        );
    }

    // 4. LẤY DANH SÁCH CHO STAFF (Có phân trang/tìm kiếm)
    getStaffProposals(params: ProposalQueryParams): Observable<PagedList<ProposalDto>> {
        let httpParams = new HttpParams()
            .set('pageNumber', params.pageNumber)
            .set('pageSize', params.pageSize)
            .set('searchTerm', params.searchTerm || '')
            .set('status', params.status || '');

        // Thêm sort column/direction nếu có
        if (params.sortColumn && params.sortDirection) {
            httpParams = httpParams.set('sortColumn', params.sortColumn);
            httpParams = httpParams.set('sortDirection', params.sortDirection);
        }

        return this.http.get<any>(`${this.apiUrl}/staff-list`, { params: httpParams })
            .pipe(map(res => res.data as PagedList<ProposalDto>));
    }

    // 5. TRẢ LỜI PROPOSAL (STAFF)
    replyProposal(id: string, dto: ProposalReplyDto): Observable<ProposalDto> {
        return this.http.put<any>(`${this.apiUrl}/reply/${id}`, dto).pipe(
            map(response => response.data as ProposalDto)
        );
    }
}