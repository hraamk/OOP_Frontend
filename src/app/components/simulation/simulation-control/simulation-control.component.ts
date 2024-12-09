import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SimulationService } from '../../../services/simulation.service';
import { EventService } from '../../../services/event.service';
import { SimulationStatus } from '../../../models/simulation-status.model';
import { interval, Subscription, switchMap, takeWhile } from 'rxjs';
import { Configuration } from '../../../models/configuration.model';

@Component({
  selector: 'app-simulation-control',
  templateUrl: './simulation-control.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class SimulationControlComponent implements OnInit, OnDestroy {
  eventId: string;
  eventName: string = '';
  eventDescription: string = '';
  configForm: FormGroup;
  isSimulationRunning: boolean = false;
  isPaused: boolean = false;
  status: SimulationStatus | null = null;
  errorMessage: string | null = null;
  private statusSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private simulationService: SimulationService,
    private eventService: EventService
  ) {
    this.eventId = this.route.snapshot.paramMap.get('id') || '';
    
    this.configForm = this.fb.group({
      vendorCount: ['', [Validators.required, Validators.min(1)]],
      customerCount: ['', [Validators.required, Validators.min(1)]],
      ticketReleaseRate: ['', [Validators.required, Validators.min(1)]],
      customerRetrievalRate: ['', [Validators.required, Validators.min(1)]],
      maxTicketCapacity: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit() {
    if (this.eventId) {
      this.loadEventDetails();
      this.checkCurrentStatus();
    }
  }

  loadEventDetails() {
    this.eventService.getEvent(this.eventId).subscribe({
      next: (event) => {
        this.eventName = event.name;
        this.eventDescription = event.description;
      },
      error: (error) => {
        console.error('Error loading event details:', error);
      }
    });
  }

  checkCurrentStatus() {
    this.simulationService.getSimulationStatus(this.eventId).subscribe({
      next: (status) => {
        this.status = status;
        this.isSimulationRunning = status.running;
        if (status.running) {
          this.startStatusPolling();
        }
      },
      error: (error) => {
        console.error('Error checking status:', error);
      }
    });
  }

  startSimulation() {
    if (this.configForm.valid && this.eventId) {
      const config: Configuration = this.configForm.value;
      this.simulationService.startSimulation(this.eventId, config)
        .subscribe({
          next: (status) => {
            this.errorMessage = null;
            this.status = status;
            this.isSimulationRunning = status.running;
            if (status.running) {
              this.startStatusPolling();
            }
          },
          error: (error) => {
            if (error.status === 400 && error.error?.running) {
              // Simulation is already running
              this.status = error.error;
              this.isSimulationRunning = true;
              this.startStatusPolling();
              this.errorMessage = 'Simulation is already running';
            } else {
              this.errorMessage = 'Failed to start simulation. Please try again.';
              console.error('Error starting simulation:', error);
            }
          }
        });
    }
  }

  stopSimulation() {
    if (this.eventId) {
      this.simulationService.stopSimulation(this.eventId)
        .subscribe({
          next: (status) => {
            this.status = status;
            this.isSimulationRunning = false;
            this.isPaused = false;
            this.stopStatusPolling();
          },
          error: (error) => {
            console.error('Error stopping simulation:', error);
            this.errorMessage = 'Failed to stop simulation. Please try again.';
          }
        });
    }
  }

  pauseSimulation() {
    if (this.eventId) {
      this.simulationService.pauseSimulation(this.eventId)
        .subscribe({
          next: (status) => {
            this.status = status;
            this.isPaused = true;
          },
          error: (error) => {
            console.error('Error pausing simulation:', error);
            this.errorMessage = 'Failed to pause simulation. Please try again.';
          }
        });
    }
  }

  resumeSimulation() {
    if (this.eventId) {
      this.simulationService.resumeSimulation(this.eventId)
        .subscribe({
          next: (status) => {
            this.status = status;
            this.isPaused = false;
          },
          error: (error) => {
            console.error('Error resuming simulation:', error);
            this.errorMessage = 'Failed to resume simulation. Please try again.';
          }
        });
    }
  }

  private startStatusPolling() {
    this.stopStatusPolling(); // Clear any existing polling

    this.statusSubscription = interval(2000)
      .pipe(
        takeWhile(() => this.isSimulationRunning),
        switchMap(() => this.simulationService.getSimulationStatus(this.eventId))
      )
      .subscribe({
        next: (status) => {
          this.status = status;
          this.isSimulationRunning = status.running;
        },
        error: (error) => {
          console.error('Error fetching status:', error);
          this.errorMessage = 'Failed to fetch simulation status.';
        }
      });
  }

  private stopStatusPolling() {
    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
    }
  }

  ngOnDestroy() {
    this.stopStatusPolling();
  }
}