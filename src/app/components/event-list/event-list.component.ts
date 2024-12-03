import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';

@Component({
    selector: 'app-event-list',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './event-list.component.html'
})
export class EventListComponent implements OnInit {
    events: Event[] = [];
    
    constructor(private eventService: EventService) {}
    
    ngOnInit(): void {
        this.loadEvents();
    }
    
    loadEvents(): void {
        console.log('Loading events...');
        this.eventService.getEvents().subscribe(
          events => {
            console.log('Received events:', events);
            this.events = events;
          },
          error => {
            console.error('Error loading events:', error);
          }
        );
      }
    
    deleteEvent(id: string): void {
        if (confirm('Are you sure you want to delete this event?')) {
            this.eventService.deleteEvent(id).subscribe(
                () => this.loadEvents(),
                error => console.error('Error deleting event:', error)
            );
        }
    }
}