import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ScnLocationFinderComponent } from './scn-location-finder.component';
import { AgmCoreModule } from 'angular2-google-maps/core';
import {} from '@types/googlemaps';
import { ScnTypeaheadModule } from '@thescene/scn-typeahead'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    AgmCoreModule.forRoot({
      apiKey: "AIzaSyD-Grt4tRffhgUQC47LIMQLSY6OYaPvOtE",
      libraries: ["places"]
    }),
    ScnTypeaheadModule
  ],
  declarations: [ScnLocationFinderComponent],
  exports: [ScnLocationFinderComponent]
})
export class ScnLocationFinderModule {
}
