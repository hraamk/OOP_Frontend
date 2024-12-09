import { Routes } from '@angular/router';
import { EventListComponent } from './components/admin/event-list/event-list.component';
import { EventFormComponent } from './components/admin/event-form/event-form.component';
import { SimulationListComponent } from './components/simulation/simulation-list/simulation-list.component';
import { SimulationControlComponent } from './components/simulation/simulation-control/simulation-control.component';
import { HomeComponent } from './components/home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  // Admin routes
  { 
    path: 'admin',
    children: [
      { path: '', redirectTo: 'events', pathMatch: 'full' },
      { path: 'events', component: EventListComponent },
      { path: 'events/new', component: EventFormComponent },
      { path: 'events/edit/:id', component: EventFormComponent },
      { path: 'events/:id/simulation', component: SimulationControlComponent }
    ]
  },
  // Simulation routes
  {
    path: 'simulation',
    children: [
      { path: '', component: SimulationListComponent },
      { path: ':id', component: SimulationControlComponent }
    ]
  }
];