import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Configuration } from '../models/configuration.model';
import { SimulationStatus } from '../models/simulation-status.model';
import { ConfigurationTemplate } from '../models/configuration.template.model';

@Injectable({
  providedIn: 'root'
})
export class SimulationService {
  private apiUrl = 'http://localhost:8080/api/simulation';
  
  constructor(private http: HttpClient) { }

  startSimulation(eventId: string, config: Configuration): Observable<SimulationStatus> {
    return this.http.post<SimulationStatus>(`${this.apiUrl}/${eventId}/start`, config);
  }

  stopSimulation(eventId: string): Observable<SimulationStatus> {
    return this.http.post<SimulationStatus>(`${this.apiUrl}/${eventId}/stop`, {});
  }

  pauseSimulation(eventId: string): Observable<SimulationStatus> {
    return this.http.post<SimulationStatus>(`${this.apiUrl}/${eventId}/pause`, {});
  }

  resumeSimulation(eventId: string): Observable<SimulationStatus> {
    return this.http.post<SimulationStatus>(`${this.apiUrl}/${eventId}/resume`, {});
  }

  getSimulationStatus(eventId: string): Observable<SimulationStatus> {
    return this.http.get<SimulationStatus>(`${this.apiUrl}/${eventId}/status`);
  }

  getAllSimulations(): Observable<Configuration[]> {
    return this.http.get<Configuration[]>(`${this.apiUrl}/all`);
  }
}