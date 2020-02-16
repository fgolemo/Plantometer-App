import { Component, OnInit } from "@angular/core";
import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { ActivatedRoute } from "@angular/router";
import * as appSettings from "tns-core-modules/application-settings";
import { TextField } from "tns-core-modules/ui/text-field";
import { PlotReading } from "~/app/sensor/reading";
import { firebase } from "nativescript-plugin-firebase/firebase-common";
import { Observable } from "rxjs";
import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";

interface Reading {
    sensor: number;
    timestamp: number;
    moisture: number;
}

@Component({
    selector: "Sensor",
    templateUrl: "./sensor.component.html"
})
export class SensorComponent implements OnInit {
    garden: string = "";
    sensor: number = -1;
    name: string = "";
    data: Array<PlotReading> = [];
    dateEnd: string;
    dateStart: string;
    dataLoaded: boolean = false;

    constructor(private _route: ActivatedRoute) {
        const end = new Date();
        end.setDate(end.getDate() + 1);
        this.dateEnd = ("0" + end.getDate()).slice(-2) + "/"
            + ("0" + (end.getMonth() + 1)).slice(-2) + "/"
            + end.getFullYear();
        const start = new Date();
        start.setDate(start.getDate() - 6);
        this.dateStart = ("0" + start.getDate()).slice(-2) + "/"
            + ("0" + (start.getMonth() + 1)).slice(-2) + "/"
            + start.getFullYear();
        // this.dateTimeSource = this.getData();
        // console.log(this.dateStart);
        // console.log(this.dateEnd);
    }

    ngOnInit(): void {
        this.garden = this._route.snapshot.params.garden;
        this.sensor = this._route.snapshot.params.sensor;
        this.name = appSettings.getString(`${this.garden}-${this.sensor}`, `Sensor ${this.sensor}`);

        // this.dateTimeSource = this.getDateTimeSource();

        firebase.query(
            this.onReading,
            `/${this.garden}/${this.sensor}`,
            {
                singleEvent: true,
                orderBy: {
                    type: firebase.QueryOrderByType.CHILD,
                    value: "timestamp" // mandatory when type is 'child'
                },
                limit: {
                    type: firebase.QueryLimitType.LAST,
                    value: 400
                }
            }
        ).then(
            (result) => {
                if (!result.error) {
                    let buf = new Array<PlotReading>();
                    Object.keys(result.value).forEach((key) => {
                        const reading = result.value[key] as Reading;
                        buf.push(new PlotReading(reading.timestamp, reading.moisture));
                    });

                    this.data = buf;
                    this.dataLoaded = true;
                } // TODO deal with error
            }
        );
    }

    onReading = (result) => {
        console.log("noop");
        // note that the query returns 1 match at a time
        // in the order specified in the query
        if (!result.error) {
            // console.log("Event type: " + result.type);
            // console.log("Key: " + result.key);
            // console.log("Value: " + JSON.stringify(result.value)); // a JSON object
            // console.log("Children: " + JSON.stringify(result.children)); // an array, added in plugin v 8.0.0

            // let reading: Reading;
            // if (result.value.hasOwnProperty("moisture")) {
            //     reading = result.value;
            // } else {
            //     reading = result.children[0];
            // }
            // // console.log("reading: " + JSON.stringify(reading)); // an array, added in plugin v 8.0.0
            // const date = new Date(reading.timestamp);
            // const hours = date.getHours();
            // const minutes = date.getMinutes();
            // const seconds = date.getSeconds();
            //
            // const formattedTime = date + "-" + hours + ":" + minutes + ":" + seconds;
            // // console.log(formattedTime);
            // this.dateTimeSource.push(new PlotReading(reading.timestamp, reading.moisture));
        }
        // console.log(this.dateTimeSource);
    }

    onDrawerButtonTap(): void {
        const sideDrawer = <RadSideDrawer>app.getRootView();
        sideDrawer.showDrawer();
    }

    onBlur(args) {
        // blur event will be triggered when the user leaves the TextField
        const textField = <TextField>args.object;
        this.name = textField.text;
        appSettings.setString(`${this.garden}-${this.sensor}`, this.name);
    }
}
