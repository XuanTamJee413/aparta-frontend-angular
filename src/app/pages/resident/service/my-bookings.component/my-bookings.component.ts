import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceBookingDto } from '../../../../models/service-booking.model';
import { ServiceBookingService } from '../../../../services/resident/service-booking.service';


@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.css']
})
export class MyBookingsComponent implements OnInit {

  myBookings: ServiceBookingDto[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(private bookingService: ServiceBookingService) { }

  ngOnInit(): void {
    this.loadMyBookings();
  }

  loadMyBookings(): void {
    this.isLoading = true;
    this.bookingService.getMyBookings().subscribe({
      next: (data) => {
        this.myBookings = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to load booking history.';
        this.isLoading = false;
      }
    });
  }
}