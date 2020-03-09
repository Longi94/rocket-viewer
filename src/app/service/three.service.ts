import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { WebGLRenderer } from 'three';

@Injectable({
  providedIn: 'root'
})
export class ThreeService {

  private rendererReadySubject = new Subject<WebGLRenderer>();
  onRendererReady = this.rendererReadySubject.asObservable();

  constructor() {
  }

  rendererReady(renderer: WebGLRenderer) {
    this.rendererReadySubject.next(renderer);
  }
}
