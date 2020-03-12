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

  private sceneResetSubject = new Subject<any>();
  onSceneReset = this.sceneResetSubject.asObservable();

  constructor() {
  }

  vrEntered() {
    this.vrEnterSubject.next();
  }

  vrLeft() {
    this.vrLeaveSubject.next();
  }

  sceneReset() {
    this.sceneResetSubject.next();
  }
}
