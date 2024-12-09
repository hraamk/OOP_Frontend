import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../../services/event.service';
import { Event } from '../../../models/event.model';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './event-form.component.html'
})
export class EventFormComponent implements OnInit {
  eventForm: FormGroup;
  isEditing = false;
  eventId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.eventForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      totalTickets: ['', [Validators.required, Validators.min(1)]],
      price: ['', [Validators.required, Validators.min(0)]],
      eventDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.eventId = this.route.snapshot.paramMap.get('id');
    if (this.eventId) {
      this.isEditing = true;
      this.loadEvent();
    }
  }

  loadEvent(): void {
    if (!this.eventId) return;
    
    this.eventService.getEvent(this.eventId).subscribe(
      event => {
        this.eventForm.patchValue({
          name: event.name,
          description: event.description,
          totalTickets: event.totalTickets,
          price: event.price,
          eventDate: new Date(event.eventDate).toISOString().slice(0, 16)
        });
      },
      error => console.error('Error loading event:', error)
    );
  }

  onSubmit(): void {
    if (this.eventForm.valid) {
      const eventData = this.eventForm.value;
      eventData.eventDate = new Date(eventData.eventDate);

      const request = this.isEditing && this.eventId
        ? this.eventService.updateEvent(this.eventId, eventData)
        : this.eventService.createEvent(eventData);

      request.subscribe(
        () => this.router.navigate(['/admin/events']),
        error => console.error('Error saving event:', error)
      );
    }
  }
}