import { Component, OnInit } from '@angular/core';
import { ReplayParser } from '../../../parser/replay';
import { BoxcarsService } from '../../../service/boxcars.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  dragging = false;
  loadingFile = false;

  fileReader = new FileReader();

  replayParser = new ReplayParser();

  constructor(private readonly boxcarsService: BoxcarsService) {
    this.fileReader.onload = (event) => {
      this.loadingFile = false;
      const replay = this.replayParser.parse(event.target.result as ArrayBuffer);
      console.log(replay);
    };
  }

  ngOnInit(): void {
  }

  onFileDrop($event: DragEvent) {
    $event.preventDefault();

    const file = $event.dataTransfer.files[0];

    // if (typeof Worker !== 'undefined') {
    //   // Create a new
    //   const worker = new Worker('./home.worker', {type: 'module'});
    //   worker.onmessage = ({data}) => {
    //     this.loadingFile = false;
    //     console.log(data);
    //   };
    //   worker.postMessage(file);
    // } else {
    //   this.fileReader.readAsArrayBuffer(file);
    // }

    this.boxcarsService.parse(file);

    this.loadingFile = true;
    this.dragging = false;
  }

  onDragEnter($event: DragEvent) {
    this.dragging = true;
  }

  onDragLeave($event: DragEvent) {
    this.dragging = false;
  }

  onDragOver($event: DragEvent) {
    $event.stopPropagation();
    $event.preventDefault();
  }
}
