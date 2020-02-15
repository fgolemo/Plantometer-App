import { Component, OnInit } from "@angular/core";
import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { ActivatedRoute } from "@angular/router";
import * as appSettings from "tns-core-modules/application-settings";
import { TextField } from "tns-core-modules/ui/text-field";

@Component({
    selector: "Sensor",
    templateUrl: "./sensor.component.html"
})
export class SensorComponent implements OnInit {
    garden: string = "";
    sensor: number = -1;
    name: string = "";
    constructor(private _route: ActivatedRoute) {
    }

    ngOnInit(): void {
        this.garden = this._route.snapshot.params.garden;
        this.sensor = this._route.snapshot.params.sensor;
        this.name = appSettings.getString(`${this.garden}-${this.sensor}`, `Sensor ${this.sensor}`);
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
