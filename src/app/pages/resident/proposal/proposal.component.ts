import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProposalService, ProposalCreateDto, ProposalDto } from '../../../services/resident/proposal.service';
import { Observable } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-resident-proposal-shell',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, 
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, 
    MatIconModule, MatSnackBarModule, MatProgressSpinnerModule, MatDividerModule,
    MatSelectModule
  ],
  templateUrl: './proposal.component.html',
  styleUrls: ['./proposal.component.css'] 
})
export class ResidentProposalComponent implements OnInit {

  private fb = inject(FormBuilder);
  private proposalService = inject(ProposalService);
  private snackBar = inject(MatSnackBar);

  proposalForm!: FormGroup;
  history$: Observable<ProposalDto[]> | undefined;
  
  isSubmitting = false;
  proposalTypes: any[] = []; 

  constructor() { }

  ngOnInit(): void {
    this.loadProposalTypes();
    this.initForm();
    this.loadHistory();
  }

  initForm(): void {
    this.proposalForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]], // 2. Thêm Title
      type: ['', [Validators.required]],                             // 3. Thêm Type
      content: ['', [Validators.required, Validators.maxLength(2000)]]
    });
  }

  loadProposalTypes(): void {
    this.proposalService.getProposalTypes().subscribe(types => {
      this.proposalTypes = types;
    });
  }

  loadHistory(): void {
    this.history$ = this.proposalService.getResidentHistory();
  }

  onSubmit(): void {
    if (this.proposalForm.invalid) {
      this.proposalForm.markAllAsTouched();
      this.snackBar.open('Vui lòng nhập nội dung đề xuất.', 'Đóng', { duration: 3000 });
      return;
    }

    this.isSubmitting = true;
    const dto: ProposalCreateDto = this.proposalForm.value;

    this.proposalService.createProposal(dto).subscribe({
      next: (newProposal) => {
        this.isSubmitting = false;
        this.snackBar.open('Đề xuất đã được gửi thành công!', 'Đóng', { duration: 3000 });
        this.proposalForm.reset();
        this.loadHistory(); // Tải lại lịch sử
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error(err);
        const errorMessage = err.error?.message || 'Lỗi: Không thể gửi đề xuất.';
        this.snackBar.open(errorMessage, 'Đóng', { duration: 5000 });
      }
    });
  }

  // Hàm tiện ích để hiển thị trạng thái bằng màu sắc
  getStatusClass(status: string): string {
    status = status.toLowerCase();
    if (status === 'completed' || status === 'resolved') return 'status-completed';
    if (status === 'pending') return 'status-pending';
    return 'status-in-progress';
  }
}