import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Configuration } from '../models/configuration.model';
import { ConfigurationTemplate } from '../models/configuration.template.model';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {
  private apiUrl = 'http://localhost:8080/api/configurations';

  constructor(private http: HttpClient) { }

  getConfigurationsByEventId(eventId: string): Observable<ConfigurationTemplate[]> {
    return this.http.get<ConfigurationTemplate[]>(`${this.apiUrl}/event/${eventId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  createConfiguration(config: ConfigurationTemplate): Observable<ConfigurationTemplate> {
    return this.http.post<ConfigurationTemplate>(this.apiUrl, config)
      .pipe(
        catchError(this.handleError)
      );
  }

  deleteConfiguration(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    return throwError(() => error);
  }
}