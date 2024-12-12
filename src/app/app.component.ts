import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { EventListComponent } from './components/admin/event-list/event-list.component';
import { EventFormComponent } from './components/admin/event-form/event-form.component';
import { SimulationControlComponent } from './components/simulation/simulation-control/simulation-control.component';

export const routes: Routes = [
  { path: '', redirectTo: 'events', pathMatch: 'full' },
  { path: 'events', component: EventListComponent },
  { path: 'events/new', component: EventFormComponent },
  { path: 'events/edit/:id', component: EventFormComponent },
  { path: 'simulation/:eventId', component: SimulationControlComponent }
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <nav class="bg-white shadow-sm">
        <div class="container mx-auto px-4">
          <div class="flex justify-between h-16 items-center">
            <div class="flex-shrink-0">
              <h1 class="text-xl font-bold">Event Ticketing System</h1>
            </div>
            <div class="hidden md:block">
              <div class="ml-10 flex items-baseline space-x-4">
                <a routerLink="/events" 
                   routerLinkActive="text-blue-600"
                   class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Accounts
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main class="container mx-auto px-4 py-6">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AppComponent {
  title = 'Event Ticketing System';
}