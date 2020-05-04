import {
    // AfterViewInit,
    Component,
    // ElementRef,
    OnInit,
    QueryList,
    // ViewChild,
    ViewChildren,
    ViewContainerRef
} from "@angular/core";
import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { ListPicker } from "tns-core-modules/ui/list-picker";

import * as appSettings from "tns-core-modules/application-settings";
import { RadialNeedle, RadRadialGauge } from "nativescript-ui-gauge";
import { Sensor } from "~/app/home/sensor";
import { Router } from "@angular/router";
import { PlatformLocation } from "@angular/common";
// import { Frame } from "tns-core-modules/ui/frame";
import { BackgroundService } from "~/app/services/background.service";
import { FbService } from "~/app/services/fb.service";

// to rerun firebase config, run `npm run config`

@Component({
    selector: "Home",
    templateUrl: "./home.component.html"
})
export class HomeComponent implements OnInit {
    showCountryPicker: boolean = false;
    listPickerCountries: Array<string> = [""];
    sensors: Array<Sensor> = [];
    // textFieldValue: string = "";
    gardenIdx: number = 0;
    // gaugesActive: Array<number> = [];
    gauges = {};
    gaugeValues = {};

    @ViewChildren("gauges") gaugeElements: QueryList<any>;
    // @ViewChild("needle", {static: false}) needleElement: ElementRef;
    @ViewChildren("needle") needleElements: QueryList<any>;

    // @ViewChild('fruit', { static: true }) fruit: ElementRef;

    constructor(
        private _vcRef: ViewContainerRef,
        private _router: Router,
        private _location: PlatformLocation,
        private _bgs: BackgroundService,
        private _fb: FbService) {
        // Use the component constructor to inject providers.
    }

    ngOnInit(): void {
        this._location.onPopState(() => {
            // refreshing when coming back to this page
            this.getGardens();
        });

        this.getGardens();
    }

    getGardens() {
        this._fb.getGardens().then((gardens) => {
            this.listPickerCountries = gardens;
            this.gardenIdx = appSettings.getNumber("gardenIdx", 0);
            this.getSensors(this.listPickerCountries[this.gardenIdx]);
            console.log("loaded saved idx of " + this.gardenIdx);
        });
    }

    getSensors(garden) {
        this._bgs.setGarden(garden);
        this._fb.getSensors(garden).then((sensors) => {
            this.sensors = sensors;
            this.makeGauges();
        });
    }

    onDrawerButtonTap(): void {
        const sideDrawer = <RadSideDrawer>app.getRootView();
        sideDrawer.showDrawer();
    }

    showHideField() {
        this.showCountryPicker = true;
    }

    selectedGardenChanged(args) {
        this.gauges = {};
        this.gaugeValues = {};
        const picker = <ListPicker>args.object;
        if (this.listPickerCountries[picker.selectedIndex] !== "") {
            appSettings.setNumber("gardenIdx", picker.selectedIndex);
            this.gardenIdx = picker.selectedIndex;
            this.getSensors(this.listPickerCountries[picker.selectedIndex]);
        }

    }

    makeGauges() {
        for (const sensor of this.sensors) {
            this.getSensor(sensor.id);
        }
    }

    getSensor(sensor) {
        const garden = this.listPickerCountries[this.gardenIdx];
        this._fb.getSensor(garden, sensor, this.onSensor, false);
    }

    onSensor = (result) => {
        // note that the query returns 1 match at a time
        // in the order specified in the query
        if (!result.error) {
            this.updateGauge(FbService.result2Reading(result));
        }
    }

    updateGauge(reading) {
        this.gauges[reading.sensor] = true;
        this.gaugeValues[reading.sensor] = reading.moisture;

        this.needleElements.toArray().forEach((item) => {
            const element = item.nativeElement as RadialNeedle;
            if (element.id.split("-")[1] === String(reading.sensor)) {
                element.value = reading.moisture;
            }
        });
        this.gaugeElements.toArray().forEach((item) => {
            const element = item.nativeElement as RadRadialGauge;
            if (element.id.split("-")[1] === String(reading.sensor)) {
                element.subtitle = String(reading.moisture);
            }
        });
    }

    openSensor(id) {
        console.log(`navigating to :/sensor/${this.listPickerCountries[this.gardenIdx]}/${id}`);
        this._router.navigate([`/sensor/${this.listPickerCountries[this.gardenIdx]}/${id}`]);
    }
}
