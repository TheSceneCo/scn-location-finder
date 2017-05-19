import {
  Component, OnInit, ViewChild, ElementRef, NgZone, Output,
  EventEmitter, Input, forwardRef
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { MapsAPILoader } from '@agm/core';
import { Http } from '@angular/http';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

export declare var google: any;


const noop = () => {
};

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => ScnLocationFinderComponent),
  multi: true
};

@Component({
  selector: 'scn-location-finder',
  templateUrl: './scn-location-finder.component.html',
  styleUrls: ['./scn-location-finder.component.scss'],
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR],
})
export class ScnLocationFinderComponent implements OnInit, ControlValueAccessor {
  _typeaheadValue: any;

  get typeaheadValue(): any {
    return this._typeaheadValue;
  };

  set typeaheadValue(v: any) {
    console.log('value', v);
    if (v !== this._typeaheadValue) {

      this._typeaheadValue = v;
      this.onChangeCallback(v);
    }
  }

  private onChangeCallback: (_: any) => void = noop;

  public writeValue(value: any): void {
    console.log('writeValue', value);
    if (value !== this._typeaheadValue) {
      if(value) {
        this.mapsAPILoader.load().then(() => {
          let geocoder = new google.maps.Geocoder();
          geocoder.geocode({'address': value}, (results, status) => {
            if (status == 'OK') {
              if (results[0]) {
                this.onChangeLocation.emit({geocode: results[0]});

                this.ngZone.run(() => {
                  //set latitude, longitude and zoom
                  this.latitude = results[0].geometry.location.lat();
                  this.longitude = results[0].geometry.location.lng();
                });
              }
            } else {
              alert('Geocode was not successful for the following reason: ' + status);
            }
          });
        });
      }


      this._typeaheadValue = value;
    }
  }

  public registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }

  public registerOnTouched(fn: any): void {
  }

  public latitude: number;
  public longitude: number;
  public searchControl: FormControl;
  public zoom: number;

  @ViewChild("search")
  public searchElementRef: ElementRef;

  public dataSource: Observable<any>;

  @Input() googleAutocomplete: boolean = false;
  @Input() map: boolean = false;
  @Output() onChangeLocation: EventEmitter<any> = new EventEmitter();

  constructor(
      private mapsAPILoader: MapsAPILoader,
      private ngZone: NgZone,
      private http: Http
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

    //load Places Autocomplete
    this.mapsAPILoader.load().then(() => {
      // console.log(this.searchElementRef);
      if (!this.searchElementRef) {
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

  setDataSource() {
    this.dataSource = Observable
        .create((observer: any) => {
          // Runs on every search
          observer.next(this.typeaheadValue);

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
    let geocoder = new google.maps.Geocoder();
    let placeId = e.item.place_id;

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
            console.log(this.typeaheadValue);
          });
        }
      }
    });
  }
}
