import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";

import { SensorRoutingModule } from "./sensor-routing.module";
import { SensorComponent } from "./sensor.component";
import { NativeScriptUIChartModule } from "nativescript-ui-chart/angular";

@NgModule({
    imports: [
        NativeScriptCommonModule,
        NativeScriptUIChartModule,
        SensorRoutingModule
    ],
    declarations: [
        SensorComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class SensorModule { }
