import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="container mx-auto px-8 py-24 bg-white">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <h1 class="text-5xl font-light text-gray-900 text-center mb-16">
          Event Ticketing System
        </h1>

        <!-- Portals Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
          <!-- Admin Portal -->
          <div class="bg-gray-50 rounded-2xl p-8 hover:transform hover:-translate-y-1 transition-all duration-200">
            <h2 class="text-2xl font-medium text-gray-900 mb-4">Admin Portal</h2>
            <p class="text-lg text-gray-500 mb-8">
              Manage events and configure settings
            </p>
            <button routerLink="/admin/events"
              class="w-full bg-black hover:bg-gray-800 text-white text-lg font-medium py-3 px-6 rounded-full transition-colors duration-200">
              Open Admin
            </button>
          </div>

          <!-- Simulation Portal -->
          <div class="bg-gray-50 rounded-2xl p-8 hover:transform hover:-translate-y-1 transition-all duration-200">
            <h2 class="text-2xl font-medium text-gray-900 mb-4">Simulation Portal</h2>
            <p class="text-lg text-gray-500 mb-8">
              Run ticket purchasing simulations
            </p>
            <button routerLink="/simulation"
              class="w-full bg-black hover:bg-gray-800 text-white text-lg font-medium py-3 px-6 rounded-full transition-colors duration-200">
              Open Simulation
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HomeComponent {}