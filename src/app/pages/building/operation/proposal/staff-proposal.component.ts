import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ProposalService, ProposalDto, ProposalReplyDto, ProposalQueryParams, PagedList } from '../../../../services/resident/proposal.service';
import { Observable, Subject, merge, of } from 'rxjs';
import { startWith, switchMap, catchError, map as RxMap, debounceTime } from 'rxjs/operators';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';


@Component({
    selector: 'app-staff-proposal-list',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, MatTableModule, MatPaginatorModule, MatSortModule,
        MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule,
        MatIconModule, MatSnackBarModule, MatProgressSpinnerModule
    ],
    templateUrl: './staff-proposal.component.html',
    styleUrls: ['./staff-proposal.component.css']
})
export class StaffProposalComponent implements OnInit {
    
    private proposalService = inject(ProposalService);
    private snackBar = inject(MatSnackBar);

    // Bảng và Phân trang
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    
    dataSource = new MatTableDataSource<ProposalDto>([]);
    displayedColumns: string[] = ['residentName', 'contentPreview', 'status', 'createdAt', 'actions'];
    
    // Tham số Query
    searchControl = new FormControl('');
    statusFilterControl = new FormControl('Pending'); // Mặc định chỉ xem trạng thái Chờ xử lý
    
    resultsLength = 0;
    isLoadingResults = true;
    
    // Chi tiết và Trả lời
    selectedProposal: ProposalDto | null = null;
    replyControl = new FormControl('', [Validators.required, Validators.maxLength(2000)]);
    isReplying = false;

    ngOnInit(): void {
        this.loadInitialData();
    }
    
    ngAfterViewInit(): void {
        // Kết hợp Paginator và Sort (Logic phân trang/sắp xếp tự động)
        this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

        merge(this.sort.sortChange, this.paginator.page, this.searchControl.valueChanges.pipe(debounceTime(400)), this.statusFilterControl.valueChanges)
            .pipe(
                startWith({}),
                switchMap(() => {
                    this.isLoadingResults = true;
                    return this.fetchProposals();
                }),
                RxMap(data => {
                    this.isLoadingResults = false;
                    this.resultsLength = data.totalCount;
                    return data.items;
                }),
                catchError((err) => {
                    this.isLoadingResults = false;
                    console.error('Lỗi tải Proposal:', err);
                    this.snackBar.open('Không thể tải danh sách đề xuất.', 'Đóng', { duration: 3000 });
                    return of([] as ProposalDto[]);
                }),
            ).subscribe(data => (this.dataSource.data = data));
    }

    fetchProposals(): Observable<PagedList<ProposalDto>> {
        const params: ProposalQueryParams = {
            pageNumber: this.paginator.pageIndex + 1,
            pageSize: this.paginator.pageSize,
            searchTerm: this.searchControl.value || undefined,
            status: this.statusFilterControl.value || undefined,
            sortColumn: this.sort.active,
            sortDirection: this.sort.direction as 'asc' | 'desc',
        };
        return this.proposalService.getStaffProposals(params);
    }

    // --- HÀM XỬ LÝ GIAO DIỆN VÀ CHI TIẾT ---
    
    openDetails(proposal: ProposalDto): void {
        this.proposalService.getProposalDetail(proposal.proposalId).subscribe(
            detail => {
                this.selectedProposal = detail;
                this.replyControl.setValue(detail.reply || ''); // Load nội dung trả lời (nếu đã có)
                
                // Mở modal hoặc hiển thị khu vực chi tiết (tùy thuộc vào thiết kế UI)
            },
            err => this.snackBar.open('Không thể tải chi tiết đề xuất.', 'Đóng', { duration: 3000 })
        );
    }
    
    // Hàm gửi trả lời
    submitReply(): void {
        if (this.replyControl.invalid || !this.selectedProposal) return;

        this.isReplying = true;
        const dto: ProposalReplyDto = { replyContent: this.replyControl.value! };
        const proposalId = this.selectedProposal.proposalId;

        this.proposalService.replyProposal(proposalId, dto).subscribe({
            next: (updatedProposal) => {
                this.isReplying = false;
                this.snackBar.open('Trả lời đã được gửi và cập nhật.', 'Đóng', { duration: 3000 });
                this.selectedProposal = updatedProposal; // Cập nhật chi tiết
                this.loadInitialData(); // Tải lại danh sách
            },
            error: (err) => {
                this.isReplying = false;
                this.snackBar.open(err.error?.message || 'Lỗi: Không thể gửi trả lời.', 'Đóng', { duration: 5000 });
            }
        });
    }

    closeDetails(): void {
        this.selectedProposal = null;
        this.replyControl.reset();
        this.loadInitialData(); // Tải lại danh sách để xem trạng thái mới nhất
    }
    
    loadInitialData(): void {
        // Tải lại dữ liệu (chủ yếu gọi hàm trong ngAfterViewInit)
        this.searchControl.setValue(this.searchControl.value);
    }

    getStatusClass(status: string): string {
        status = status.toLowerCase();
        if (status === 'completed' || status === 'resolved') return 'status-completed';
        if (status === 'pending') return 'status-pending';
        return 'status-in-progress';
    }

    truncateContent(content: string | null): string {
        if (!content) return '';
        return content.length > 50 ? content.substring(0, 50) + '...' : content;
    }
}