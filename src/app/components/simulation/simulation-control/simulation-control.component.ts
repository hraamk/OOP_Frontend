import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SimulationService } from '../../../services/simulation.service';
import { EventService } from '../../../services/event.service';
import { ConfigurationService } from '../../../services/configuration.service';
import { SimulationStatus } from '../../../models/simulation-status.model';
import { WebSocketService } from '../../../services/websocket.service';
import { interval, Subscription, switchMap, takeWhile } from 'rxjs';
import { Configuration } from '../../../models/configuration.model';
import { ConfigurationTemplate } from '.././../../models/configuration.template.model';


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
  templates: ConfigurationTemplate[] = [];
  templateForm: FormGroup;
  selectedTemplate: ConfigurationTemplate | null = null;
  ticketPoolInfo: { available: number, capacity: number } = { available: 0, capacity: 0 };
  private webSocketSubscription?: Subscription;


  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private simulationService: SimulationService,
    private configurationService: ConfigurationService,
    private eventService: EventService,
    private webSocketService: WebSocketService
  ) {
    this.eventId = this.route.snapshot.paramMap.get('id') || '';
    
    this.configForm = this.fb.group({
      vendorCount: ['', [Validators.required, Validators.min(1)]],
      customerCount: ['', [Validators.required, Validators.min(1)]],
      ticketReleaseRate: ['', [Validators.required, Validators.min(1)]],
      customerRetrievalRate: ['', [Validators.required, Validators.min(1)]],
      maxTicketCapacity: ['', [Validators.required, Validators.min(1)]],
      templateName: [''] // Optional field for template name
    });
  
    // Initialize templateForm
    this.templateForm = this.fb.group({
      templateName: ['', [Validators.required, Validators.minLength(3)]]
    });
  }


  ngOnInit() {
    if (this.eventId) {
      this.loadEventDetails();
      this.checkCurrentStatus();
      this.loadTemplates();
      console.log('Initializing WebSocket connection for event:', this.eventId);
      this.subscribeToTicketUpdates();
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
  private subscribeToTicketUpdates() {
    // No need to call subscribeToTicketUpdates since we removed that method
    this.webSocketSubscription = this.webSocketService.ticketUpdates$.subscribe(
      update => {
        if (update && update.eventId === this.eventId) {
          console.log('Received ticket update:', update);
          this.ticketPoolInfo = {
            available: update.availableTickets,
            capacity: update.totalCapacity
          };
        }
      },
      error => console.error('WebSocket error:', error)
    );
  }


  checkCurrentStatus(): void {
    this.simulationService.getSimulationStatus(this.eventId).subscribe({
      next: (status) => {
        this.status = status;
        this.isSimulationRunning = status.running;
        if (status.running) {
          this.startStatusPolling();
        }
      },
      error: (error: any) => {
        console.error('Error checking status:', error);
        this.errorMessage = 'Failed to check simulation status: ' + (error.error?.message || error.message || 'Unknown error');
      }
    });
  }
  
  loadTemplate(template: ConfigurationTemplate): void {
    this.selectedTemplate = template;
    this.configForm.patchValue({
      vendorCount: template.vendorCount,
      customerCount: template.customerCount,
      ticketReleaseRate: template.ticketReleaseRate,
      customerRetrievalRate: template.customerRetrievalRate,
      maxTicketCapacity: template.maxTicketCapacity
    });
  }


  saveTemplate(): void {
    if (this.configForm.valid && this.configForm.get('templateName')?.value) {
      const formValues = this.configForm.value;
      const template: ConfigurationTemplate = {
        vendorCount: formValues.vendorCount,
        customerCount: formValues.customerCount,
        ticketReleaseRate: formValues.ticketReleaseRate,
        customerRetrievalRate: formValues.customerRetrievalRate,
        maxTicketCapacity: formValues.maxTicketCapacity,
        templateName: formValues.templateName,
        eventId: this.eventId,
        running: false,
        paused: false
      };
  
      this.configurationService.createConfiguration(template).subscribe({
        next: (savedTemplate: ConfigurationTemplate) => {
          this.templates = [...this.templates, savedTemplate];
          this.configForm.patchValue({ templateName: '' });
          this.errorMessage = null;
        },
        error: (error: Error) => {
          console.error('Error saving template:', error);
          this.errorMessage = 'Failed to save configuration template';
        }
      });
    }
  }



  loadTemplates(): void {
    this.configurationService.getConfigurationsByEventId(this.eventId).subscribe({
      next: (templates: ConfigurationTemplate[]) => {
        this.templates = templates || [];
      },
      error: (error: any) => {
        console.error('Error loading templates:', error);
        this.errorMessage = 'Failed to load configuration templates: ' + (error.error?.message || error.message || 'Unknown error');
        this.templates = [];
      }
    });
  }


  deleteTemplate(template: ConfigurationTemplate): void {
    if (template.id) {
      this.configurationService.deleteConfiguration(template.id).subscribe({
        next: () => {
          this.templates = this.templates.filter(t => t.id !== template.id);
          if (this.selectedTemplate?.id === template.id) {
            this.selectedTemplate = null;
          }
          this.errorMessage = null;
        },
        error: (error: Error) => {
          console.error('Error deleting template:', error);
          this.errorMessage = 'Failed to delete configuration template';
        }
      });
    }
  }

  startSimulation() {   
      if (this.configForm.valid && this.eventId) {
        const config: Configuration = {
          ...this.configForm.value,
          eventId: this.eventId,
          running: false,
          paused: false
        };
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
  increaseVendors(count: number = 1) {
    if (this.eventId) {
      this.simulationService.increaseVendorCount(this.eventId, count).subscribe({
        next: (status) => {
          this.status = status;
          this.errorMessage = null;
        },
        error: (error) => {
          console.error('Error increasing vendor count:', error);
          this.errorMessage = 'Failed to increase vendor count. Please try again.';
        }
      });
    }
  }

  decreaseVendors(count: number = 1) {
    if (this.eventId) {
      this.simulationService.decreaseVendorCount(this.eventId, count).subscribe({
        next: (status) => {
          this.status = status;
          this.errorMessage = null;
        },
        error: (error) => {
          console.error('Error decreasing vendor count:', error);
          this.errorMessage = 'Failed to decrease vendor count. Please try again.';
        }
      });
    }
  }

  increaseCustomers(count: number = 1) {
    if (this.eventId) {
      this.simulationService.increaseCustomerCount(this.eventId, count).subscribe({
        next: (status) => {
          this.status = status;
          this.errorMessage = null;
        },
        error: (error) => {
          console.error('Error increasing customer count:', error);
          this.errorMessage = 'Failed to increase customer count. Please try again.';
        }
      });
    }
  }

  decreaseCustomers(count: number = 1) {
    if (this.eventId) {
      this.simulationService.decreaseCustomerCount(this.eventId, count).subscribe({
        next: (status) => {
          this.status = status;
          this.errorMessage = null;
        },
        error: (error) => {
          console.error('Error decreasing customer count:', error);
          this.errorMessage = 'Failed to decrease customer count. Please try again.';
        }
      });
    }
  }
  


  private stopStatusPolling() {
    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
    }
  }

  ngOnDestroy() {
    this.stopStatusPolling();
    if (this.webSocketSubscription) {
      this.webSocketSubscription.unsubscribe();
    }
    this.webSocketService.disconnect();
  }
}