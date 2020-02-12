import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

declare global {
  interface Window {
    wasmInit: (path: string) => Promise<any>;
    wasmModule: BoxcarsWasm;
  }

  interface BoxcarsWasm {
    parse_replay(data: Uint8Array): any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class BoxcarsService {

  wasmModuleRef: BoxcarsWasm;

  private wasmReadySubject: Subject<boolean> = new Subject<boolean>();
  wasmReady$: Observable<boolean> = this.wasmReadySubject.asObservable();

  constructor() {
    window.wasmInit('/assets/boxcars/boxcars_wasm_bg.wasm').then(() => {
      this.wasmReadySubject.next();
    });
    this.wasmModuleRef = window.wasmModule;
  }

  async parse(file) {
    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      const replay = this.wasmModuleRef.parse_replay(new Uint8Array(event.target.result as ArrayBuffer));
      console.log(replay);
    };
    fileReader.readAsArrayBuffer(file);
  }
}
