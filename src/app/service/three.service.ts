import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThreeService {

  private vrEnterSubject = new Subject<any>();
  onVrEnter = this.vrEnterSubject.asObservable();

  private vrLeaveSubject = new Subject<any>();
  onVrLeave = this.vrLeaveSubject.asObservable();

  constructor() {
  }

  vrEntered() {
    this.vrEnterSubject.next();
  }

  vrLeft() {
    this.vrLeaveSubject.next();
  }
}
