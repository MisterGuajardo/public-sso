import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface LoginPayload {
  email: string;
  password: string;
  systemUrl?: string;
}

export interface AuthResponse {
  accessToken: string;
  redirectUrl: string;
  accessGrantedToRequestedSystem: boolean;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  system?: {
    id: string;
    name: string;
  } | null;
}

@Injectable({
  providedIn: 'root',
})
export class AppService {
  constructor(private http: HttpClient) {}

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, payload);
  }
}
