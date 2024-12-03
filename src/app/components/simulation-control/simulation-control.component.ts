import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SimulationService } from '../../services/simulation.service';
import { EventService } from '../../services/event.service';
import { SimulationStatus } from '../../models/simulation-status.model';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-simulation-control',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './simulation-control.component.html'
})
export class SimulationControlComponent implements OnInit, OnDestroy {
  configForm: FormGroup;
  eventId: string = '';
  eventName: string = '';
  eventDescription: string = '';
  isSimulationRunning = false;
  isPaused = false;
  status: SimulationStatus | null = null;
  private statusSubscription?: Subscription;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private simulationService: SimulationService,
    private eventService: EventService
  ) {
    this.configForm = this.fb.group({
      vendorCount: [5, [Validators.required, Validators.min(1)]],
      customerCount: [100, [Validators.required, Validators.min(1)]],
      ticketReleaseRate: [10, [Validators.required, Validators.min(1)]],
      customerRetrievalRate: [20, [Validators.required, Validators.min(1)]],
      maxTicketCapacity: [1000, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.eventId = this.route.snapshot.paramMap.get('eventId') || '';
    if (this.eventId) {
      this.loadEventDetails();
      this.checkSimulationStatus();
    }
  }

  ngOnDestroy(): void {
    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
    }
  }

  loadEventDetails(): void {
    this.eventService.getEvent(this.eventId).subscribe(
      event => {
        this.eventName = event.name;
        this.eventDescription = event.description;
      },
      error => console.error('Error loading event details:', error)
    );
  }

  checkSimulationStatus(): void {
    this.simulationService.getSimulationStatus(this.eventId).subscribe(
      status => {
        this.status = status;
        this.isSimulationRunning = status.isRunning || false;  // Changed from running to isRunning
        this.isPaused = status.isPaused || false;              // Changed from paused to isPaused
        if (this.isSimulationRunning) {
          this.startStatusPolling();
        }
      },
      error => console.error('Error checking simulation status:', error)
    );
  }

  startSimulation(): void {
    if (this.configForm.valid) {
      this.simulationService.startSimulation(this.eventId, this.configForm.value).subscribe(
        () => {
          this.isSimulationRunning = true;
          this.startStatusPolling();
        },
        error => console.error('Error starting simulation:', error)
      );
    }
  }

  stopSimulation(): void {
    this.simulationService.stopSimulation(this.eventId).subscribe(
      () => {
        this.isSimulationRunning = false;
        if (this.statusSubscription) {
          this.statusSubscription.unsubscribe();
        }
      },
      error => console.error('Error stopping simulation:', error)
    );
  }

  pauseSimulation(): void {
    this.simulationService.pauseSimulation(this.eventId).subscribe(
      () => this.isPaused = true,
      error => console.error('Error pausing simulation:', error)
    );
  }

  resumeSimulation(): void {
    this.simulationService.resumeSimulation(this.eventId).subscribe(
      () => this.isPaused = false,
      error => console.error('Error resuming simulation:', error)
    );
  }

  startStatusPolling(): void {
    this.statusSubscription = interval(1000).subscribe(() => {
      this.simulationService.getSimulationStatus(this.eventId).subscribe(
        status => {
          this.status = status;
          this.isSimulationRunning = status.isRunning || false;
          this.isPaused = status.isPaused || false;
        },
        error => console.error('Error fetching simulation status:', error)
      );
    });
  }
}