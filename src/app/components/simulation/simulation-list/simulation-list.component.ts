import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventService } from '../../../services/event.service';
import { Event } from '../../../models/event.model';

@Component({
  selector: 'app-simulation-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto px-8 py-12 bg-white">
      <!-- Header -->
      <div class="flex justify-between items-center mb-12">
        <h1 class="text-4xl font-light text-gray-900">Simulation Events</h1>
        <button routerLink="/"
          class="bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-3 px-6 rounded-full transition-colors duration-200">
          Back
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="text-center py-12">
        <p class="text-xl text-gray-400">Loading events...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error" 
        class="bg-red-50 px-6 py-4 rounded-2xl mb-8">
        <p class="text-red-600">{{error}}</p>
      </div>

      <!-- Events Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div *ngFor="let event of events"
          class="bg-gray-50 rounded-2xl p-6 hover:transform hover:-translate-y-1 transition-all duration-200">
          
          <!-- Event Header -->
          <h2 class="text-2xl font-medium text-gray-900 mb-3">{{event.name}}</h2>
          <p class="text-gray-500 text-lg mb-6">{{event.description}}</p>

          <!-- Event Details -->
          <div class="space-y-3 mb-8">
            <div class="flex justify-between items-center">
              <span class="text-gray-500">Date</span>
              <span class="text-gray-900">{{event.eventDate | date:'medium'}}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-500">Available Tickets</span>
              <span class="text-gray-900">{{event.totalTickets}}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-500">Price</span>
              <span class="text-gray-900">{{event.price | currency}}</span>
            </div>
          </div>

          <!-- Action Button -->
          <button [routerLink]="['/simulation', event.id]"
            class="w-full bg-black hover:bg-gray-800 text-white text-lg font-medium py-3 px-6 rounded-full transition-colors duration-200">
            Start Simulation
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && events.length === 0" class="text-center py-24">
        <p class="text-xl text-gray-400">No events available for simulation.</p>
      </div>
    </div>
  `
})
export class SimulationListComponent implements OnInit {
  events: Event[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.isLoading = true;
    this.error = null;
    
    this.eventService.getEvents().subscribe({
      next: (events) => {
        this.events = events;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Failed to load events. Please try again.';
        this.isLoading = false;
        console.error('Error loading events:', error);
      }
    });
  }
}