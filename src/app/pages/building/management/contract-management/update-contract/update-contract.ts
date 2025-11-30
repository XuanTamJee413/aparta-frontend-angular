import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

import {
  ContractDto,
  ContractManagementService,
  ContractUpdateDto
} from '../../../../../services/management/contract-management.service';

@Component({
  selector: 'app-update-contract',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './update-contract.html',
  styleUrls: ['./update-contract.css']
})
export class UpdateContract implements OnInit {

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private contractService = inject(ContractManagementService);
  private sanitizer = inject(DomSanitizer);

  form!: FormGroup;

  isLoading = false;
  isSaving = false;
  errorMessage: string | null = null;

  contract: ContractDto | null = null;

  previewUrl: string | null = null;
  safePreviewUrl: SafeUrl | null = null;
  selectedFileName: string | null = null;
  selectedFile: File | null = null;
  previewMode: 'none' | 'image' | 'pdf' | 'link' = 'none';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage = 'Không tìm thấy mã hợp đồng trên URL.';
      return;
    }

    this.loadContract(id);
  }

  private loadContract(id: string): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.contractService.getContractById(id).subscribe({
      next: (c) => {
        this.contract = c;
        this.buildForm();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Lỗi load hợp đồng:', err);
        this.errorMessage = 'Không thể tải thông tin hợp đồng. Vui lòng thử lại.';
        this.isLoading = false;
      }
    });
  }

  private buildForm(): void {
    if (!this.contract) return;

    this.form = this.fb.group({
      image: [this.contract.image ?? '', [Validators.maxLength(2_000_000)]]
    });

    this.previewUrl = this.contract.image ?? null;
    this.selectedFileName = null;

    if (this.previewUrl) {
      if (this.previewUrl.startsWith('data:application/pdf')) {
        this.previewMode = 'pdf';
      } else if (this.previewUrl.startsWith('data:') || this.previewUrl.match(/\.(png|jpe?g|gif|webp)$/i)) {
        this.previewMode = 'image';
      } else {
        this.previewMode = 'link';
      }

      this.safePreviewUrl = this.sanitizer.bypassSecurityTrustUrl(this.previewUrl);
    } else {
      this.previewMode = 'none';
      this.safePreviewUrl = null;
    }
  }

  get pdfUrl(): string | null {
    if (!this.contract) return null;
    return this.contractService.getContractPdfUrl(this.contract.contractId);
  }

  formatDate(value: string | null | undefined): string {
    if (!value) return '—';
    return value.substring(0, 10);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.selectedFile = file;
    this.selectedFileName = file.name;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      this.form.patchValue({ image: result });
      this.previewUrl = result;

      if (result.startsWith('data:application/pdf')) {
        this.previewMode = 'pdf';
      } else {
        this.previewMode = 'image';
      }

      this.safePreviewUrl = this.sanitizer.bypassSecurityTrustUrl(result);
    };

    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    if (!this.contract || !this.form) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.value;

    const payload: ContractUpdateDto = {
      image: formValue.image
    };

    this.isSaving = true;
    this.errorMessage = null;

    this.contractService.updateContract(
      this.contract.contractId,
      payload,
      this.selectedFile || undefined
    ).subscribe({
      next: () => {
        this.isSaving = false;
        this.router.navigate(['/manager/manage-contract']);
      },
      error: (err) => {
        console.error('Lỗi khi cập nhật hợp đồng:', err);
        this.isSaving = false;
        this.errorMessage =
          err?.error?.message || 'Không thể cập nhật hợp đồng. Vui lòng thử lại.';
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/manager/manage-contract']);
  }
}
