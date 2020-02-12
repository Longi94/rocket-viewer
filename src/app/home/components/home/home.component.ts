import { Component, OnInit } from '@angular/core';
import { BoxcarsService } from '../../../service/boxcars.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  dragging = false;
  loadingFile = false;

  constructor(private readonly boxcarsService: BoxcarsService) {
  }

  ngOnInit(): void {
  }

  onFileDrop($event: DragEvent) {
    $event.preventDefault();

    const file = $event.dataTransfer.files[0];

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
