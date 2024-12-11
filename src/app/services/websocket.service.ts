import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, filter } from 'rxjs/operators';

export interface TicketPoolUpdate {
  eventId: string;
  availableTickets: number;
  totalCapacity: number;
}

export enum ConnectionStatus {
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR'
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService implements OnDestroy {
  private ws: WebSocket | null = null;
  private connectionStatus = new BehaviorSubject<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  private ticketUpdateSubject = new BehaviorSubject<TicketPoolUpdate | null>(null);
  private destroySubject = new Subject<void>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  public readonly ticketUpdates$: Observable<TicketPoolUpdate> = this.ticketUpdateSubject.pipe(
    filter((update): update is TicketPoolUpdate => update !== null),
    distinctUntilChanged((prev, curr) => 
      prev.eventId === curr.eventId && 
      prev.availableTickets === curr.availableTickets &&
      prev.totalCapacity === curr.totalCapacity
    )
  );
  
  public readonly connectionStatus$ = this.connectionStatus.asObservable();

  constructor() {
    this.initializeWebSocket();
  }

  private initializeWebSocket(): void {
    try {
      this.ws = new WebSocket('ws://localhost:8080/ws');
      this.connectionStatus.next(ConnectionStatus.CONNECTING);

      this.ws.onopen = () => {
        console.log('[WebSocket] Connected');
        this.connectionStatus.next(ConnectionStatus.CONNECTED);
        this.reconnectAttempts = 0;
      };

      this.ws.onclose = () => {
        console.log('[WebSocket] Disconnected');
        this.connectionStatus.next(ConnectionStatus.DISCONNECTED);
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        this.connectionStatus.next(ConnectionStatus.ERROR);
      };

      this.ws.onmessage = (event) => {
        this.handleTicketUpdate(event.data);
      };
    } catch (error) {
      console.error('[WebSocket] Initialization error:', error);
      this.connectionStatus.next(ConnectionStatus.ERROR);
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`[WebSocket] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => this.initializeWebSocket(), 5000);
    } else {
      console.error('[WebSocket] Max reconnection attempts reached');
      this.connectionStatus.next(ConnectionStatus.ERROR);
    }
  }

  private handleTicketUpdate(message: string): void {
    try {
      // Split CSV message and trim any whitespace
      const [eventId, capacity, available] = message.split(',').map(value => value.trim());
      
      const update: TicketPoolUpdate = {
        eventId: eventId,
        totalCapacity: Number(capacity),
        availableTickets: Number(available)
      };

      console.log('[WebSocket] Received ticket update:', update);
      this.ticketUpdateSubject.next(update);
    } catch (error) {
      console.error('[WebSocket] Error parsing ticket update:', error);
    }
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.destroySubject.next();
    this.destroySubject.complete();
  }
}