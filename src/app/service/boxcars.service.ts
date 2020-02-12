import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Replay } from '../model/replay/replay';
import { parse_replay } from '../boxcars/boxcars_wasm';

@Injectable({
  providedIn: 'root'
})
export class BoxcarsService {

  private resultSubject: Subject<Replay | string> = new Subject<Replay | string>();
  onResult = this.resultSubject.asObservable();

  constructor() {
  }

  parse(file) {
    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      const replay = parse_replay(new Uint8Array(event.target.result as ArrayBuffer));
      this.resultSubject.next(replay);
    };
    fileReader.readAsArrayBuffer(file);
  }
}
