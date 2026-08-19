import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class EventService{
    private apiUrl = 'http://localhost:4200/event';

    constructor(private http: HttpClient){}

    getEventCountToday(): Observable<number>{
        return this.http.get<number>(`${this.apiUrl}/getEventCount`);
    }
}