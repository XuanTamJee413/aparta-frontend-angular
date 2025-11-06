import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApartmentService, ApartmentUpdateDto } from '../../../../../services/building/apartment.service';

@Component({
  selector: 'app-edit-apartment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-apartment.component.html',
  styleUrls: ['./edit-apartment.component.css']
})
export class EditApartment implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly apartmentService = inject(ApartmentService);

  isLoading = signal(true);
  submitting = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  apartmentCode = signal<string>('');

  private apartmentId: string | null = null;

  form = this.fb.group({
    code: ['', [Validators.required]],
    area: [0, [Validators.required, Validators.min(1)]]
  });

  ngOnInit(): void {
    this.apartmentId = this.route.snapshot.paramMap.get('id');

    if (!this.apartmentId) {
      this.isLoading.set(false);
      this.error.set('Không tìm thấy ID căn hộ trong URL.');
      return;
    }

    this.apartmentService.getApartmentById(this.apartmentId).subscribe({
      next: (apartment) => {
        this.form.patchValue({
          code: apartment.code,
          area: apartment.area
        });
        this.apartmentCode.set(apartment.code);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set('Không thể tải dữ liệu căn hộ.');
        console.error(err);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid || !this.apartmentId) return;

    this.submitting.set(true);
    this.error.set(null);
    this.success.set(null);

    const updateDto: ApartmentUpdateDto = {
      code: this.form.value.code!,
      area: this.form.value.area!
    };

    this.apartmentService.updateApartment(this.apartmentId, updateDto).subscribe({
      next: () => {
        this.submitting.set(false);
        this.success.set('Cập nhật căn hộ thành công!');
        this.apartmentCode.set(updateDto.code!);

        setTimeout(() => {
          this.router.navigate(['manager/manage-apartment']);
        }, 1500);
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err?.error?.message || 'Cập nhật thất bại.');
        console.error(err);
      }
    });
  }
}
