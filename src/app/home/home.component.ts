import {
    AfterViewInit,
    Component,
    ElementRef,
    OnInit,
    QueryList,
    ViewChild,
    ViewChildren,
    ViewContainerRef
} from "@angular/core";
import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { ListPicker } from "tns-core-modules/ui/list-picker";

const firebase = require("nativescript-plugin-firebase");
import * as appSettings from "tns-core-modules/application-settings";
import { RadialNeedle, RadRadialGauge } from "nativescript-ui-gauge";
import { Sensor } from "~/app/home/sensor";

// to rerun firebase config, run `npm run config`
interface Reading {
    sensor: number;
    timestamp: number;
    moisture: number;
}

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
    sensorMoistLimits: Array<number> = []; // TODO later load these from the user settings
    sensorWarnLimits: Array<number> = []; // TODO later load these from the user settings

    @ViewChildren("gauges") gaugeElements: QueryList<any>;
    // @ViewChild("needle", {static: false}) needleElement: ElementRef;
    @ViewChildren("needle") needleElements: QueryList<any>;

    // @ViewChild('fruit', { static: true }) fruit: ElementRef;

    constructor(private _vcRef: ViewContainerRef) {
        // Use the component constructor to inject providers.
    }

    ngOnInit(): void {
        this.sensorWarnLimits = [appSettings.getNumber("defaultWarn", 10)];
        this.sensorMoistLimits = [appSettings.getNumber("defaultMoist", 30)];

        // Init your component properties here.
        firebase.init({
            // Optionally pass in properties for database, authentication and cloud messaging,
            // see their respective docs.
        }).then(
            () => {
                console.log("firebase.init done");
                this.getGardens();
            },
            (error) => {
                console.log(`firebase.init error: ${error}. Trying to get gardens anyway`);
                this.getGardens();
            }
        );
    }

    getGardens(): void {
        firebase.getValue("/gardens")
            .then((result) => {
                console.log(JSON.stringify(result.value));
                this.listPickerCountries = result.value;
                this.gardenIdx = appSettings.getNumber("gardenIdx", 0);
                this.getSensors(this.listPickerCountries[this.gardenIdx]);
                console.log("loaded saved idx of " + this.gardenIdx);
            })
            .catch((error) => console.log("Error: " + error));
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
        // this.showCountryPicker = false;
        // this.textFieldValue = this.listPickerCountries[picker.selectedIndex];
        if (this.listPickerCountries[picker.selectedIndex] !== "") {
            appSettings.setNumber("gardenIdx", picker.selectedIndex);
            this.gardenIdx = picker.selectedIndex;
            this.getSensors(this.listPickerCountries[picker.selectedIndex]);
        }

    }

    getSensors(garden) {
        this.sensors = new Array<Sensor>();

        firebase.getValue(`/${garden}/sensors`)
            .then((result) => {
                result.value.forEach((val) => {
                    if (!this.sensors.some((e) => e.id === val)) {
                        this.sensors.push(new Sensor(val));
                    }
                });
                this.makeGauges();
            })
            .catch((error) => console.log("Error: " + error));
    }

    makeGauges() {
        for (const sensor of this.sensors) {
            this.getSensor(sensor.id);
        }
    }

    getSensor(sensor) {
        console.log("querying:" + `/${this.listPickerCountries[this.gardenIdx]}/${sensor}`);
        firebase.query(
            this.onSensor,
            `/${this.listPickerCountries[this.gardenIdx]}/${sensor}`,
            {
                // singleEvent: true,
                orderBy: {
                    type: firebase.QueryOrderByType.CHILD,
                    value: "timestamp" // mandatory when type is 'child'
                },
                limit: {
                    type: firebase.QueryLimitType.LAST,
                    value: 1
                }
            }
        );
    }

    onSensor = (result) => {
        // note that the query returns 1 match at a time
        // in the order specified in the query
        if (!result.error) {
            // console.log("Event type: " + result.type);
            // console.log("Key: " + result.key);
            // console.log("Value: " + JSON.stringify(result.value)); // a JSON object
            // console.log("Children: " + JSON.stringify(result.children)); // an array, added in plugin v 8.0.0

            let reading: Reading;
            if (result.value.hasOwnProperty("moisture")) {
                reading = result.value;
            } else {
                reading = result.children[0];
            }
            console.log("reading: " + JSON.stringify(reading)); // an array, added in plugin v 8.0.0

            this.updateGauge(reading);
            // if (!this.gauges.hasOwnProperty(reading.sensor)) {
            //     // console.log("making new gauge");
            //     this.updateGauge(reading);
            //
            // } else {
            //     // console.log("updating gauge: " + reading.moisture);
            //     this.updateGauge(reading);
            // }
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
}
