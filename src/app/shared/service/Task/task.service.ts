import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class TaskService{
    private apiUrl = 'http://localhost:4200/tasks';

    constructor(private http: HttpClient){}

    getTaskCountToday(): Observable<number>{
        return this.http.get<number>(`${this.apiUrl}/taskByDate`)
    }
}