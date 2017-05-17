import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sample',
  templateUrl: './sample.component.html',
  styleUrls: ['./sample.component.scss']
})
export class SampleComponent implements OnInit {
  locationModel: any;

  constructor() { }

  ngOnInit() {
  }

  onChangeLocation(event) {
    this.locationModel = event;
    console.log('Event', event);
  }

}
