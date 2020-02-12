import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Replay } from '../model/replay/replay';

declare global {
  interface Window {
    wasmInit: (path: string) => Promise<any>;
    wasmModule: BoxcarsWasm;
  }

  interface BoxcarsWasm {
    parse_replay(data: Uint8Array): Replay | string;
  }
}

@Injectable({
  providedIn: 'root'
})
export class BoxcarsService {

  wasmModuleRef: BoxcarsWasm;

  private wasmReadySubject: Subject<boolean> = new Subject<boolean>();
  wasmReady$: Observable<boolean> = this.wasmReadySubject.asObservable();

  private resultSubject: Subject<Replay | string> = new Subject<Replay | string>();
  onResult = this.resultSubject.asObservable();

  constructor() {
    window.wasmInit('/assets/boxcars/boxcars_wasm_bg.wasm').then(() => {
      this.wasmReadySubject.next();
    });
    this.wasmModuleRef = window.wasmModule;
  }

  parse(file) {
    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      const replay = this.wasmModuleRef.parse_replay(new Uint8Array(event.target.result as ArrayBuffer));
      this.resultSubject.next(replay);
    };
    fileReader.readAsArrayBuffer(file);
  }
}
