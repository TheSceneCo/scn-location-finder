import {
  Component, OnInit, ViewChild, ElementRef, NgZone, Output,
  EventEmitter, Input
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MapsAPILoader } from 'angular2-google-maps/core';
import { Observable } from 'rxjs';

declare var google;

@Component({
  selector: 'scn-location-finder',
  templateUrl: './scn-location-finder.component.html',
  styleUrls: ['./scn-location-finder.component.scss']
})
export class ScnLocationFinderComponent implements OnInit {
  public latitude: number;
  public longitude: number;
  public searchControl: FormControl;
  public zoom: number;

  @ViewChild("search")
  public searchElementRef: ElementRef;


  public asyncSelected: string;
  public dataSource: Observable<any>;

  @Input() googleAutocomplete: boolean = false;
  @Input() map: boolean = false;
  @Output() onChangeLocation: EventEmitter<any> = new EventEmitter();

  constructor(
      private mapsAPILoader: MapsAPILoader,
      private ngZone: NgZone
  ) {
    this.setDataSource();
  }

  ngOnInit() {
    //set google maps defaults
    this.zoom = 4;
    this.latitude = 39.8282;
    this.longitude = -98.5795;

    //create search FormControl
    this.searchControl = new FormControl();

    //set current position
    this.setCurrentPosition();

    //load Places Autocomplete
    this.mapsAPILoader.load().then(() => {
      // console.log(this.searchElementRef);
      if(!this.searchElementRef) {
        return;
      }
      let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
        types: ["address"]
      });
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          //get the place result
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();

          //verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }

          this.onChangeLocation.emit(place);

          //set latitude, longitude and zoom
          this.latitude = place.geometry.location.lat();
          this.longitude = place.geometry.location.lng();
          this.zoom = 12;
        });
      });
    });
  }

  private setCurrentPosition() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.zoom = 12;
      });
    }
  }

  setDataSource() {
    this.dataSource = Observable
        .create((observer: any) => {
          // Runs on every search
          observer.next(this.asyncSelected);

        })
        .mergeMap((token: string) => {
          return this.getData(token);
        });
  }

  getLocation(token): Promise<any> {
    return this.mapsAPILoader.load().then(() => {
      let service = new google.maps.places.AutocompleteService();
      return new Promise((resolve, reject) => {
        service.getQueryPredictions({input: token}, (data) => {
          if (!data) {
            resolve([]);
          }
          resolve(data);

        }, (error) => {
          reject(error);
        })
      });
    })
  }

  getData(token): Observable<any> {
    return Observable.fromPromise(this.getLocation(token));
  }

  typeaheadOnSelect(e: any) {
    let placeId = e.item.place_id;
    let geocoder = new google.maps.Geocoder();

    if (!e.item.place_id) {
      return;
    }

    geocoder.geocode({'placeId': placeId}, (results, status) => {
      if (status === 'OK') {
        if (results[0]) {
          this.ngZone.run(() => {
            //set latitude, longitude and zoom
            this.latitude = results[0].geometry.location.lat();
            this.longitude = results[0].geometry.location.lng();

            this.onChangeLocation.emit({item: e, geocode: results[0]});
          });
        }
      }
    });
  }
}
