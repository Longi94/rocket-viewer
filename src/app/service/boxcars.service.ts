import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Replay } from '../model/replay/replay';
import { parse_and_clean_replay } from '../boxcars/boxcars_wasm';
import { environment } from '../../environments/environment';

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
      const replay = parse_and_clean_replay(new Uint8Array(event.target.result as ArrayBuffer));
      this.resultSubject.next(replay);
      if (!environment.production) {
        console.log(replay);
      }
    };
    fileReader.readAsArrayBuffer(file);
  }
}
