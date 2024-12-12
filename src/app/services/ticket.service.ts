import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = 'http://localhost:8080';  // Make sure this points to your Spring Boot backend

  constructor(private http: HttpClient) { }

  getTicketsByEventId(eventId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/tickets/event/${eventId}`);
  }

  getAvailableTickets(eventId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/tickets/event/${eventId}/available`);
  }

  getTicketCount(eventId: string, status?: string): Observable<number> {
    let url = `${this.apiUrl}/api/tickets/event/${eventId}/count`;
    if (status) {
      url += `?status=${status}`;
    }
    return this.http.get<number>(url);
  }
}