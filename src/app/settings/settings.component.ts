import { Component, OnInit } from "@angular/core";
import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import * as appSettings from "tns-core-modules/application-settings";

@Component({
    selector: "Settings",
    templateUrl: "./settings.component.html"
})

export class SettingsComponent implements OnInit {
    defaultWarn: number = 10;
    defaultMoist: number = 30;

    constructor() {

        // Use the component constructor to inject providers.
    }

    ngOnInit(): void {
        this.defaultWarn = appSettings.getNumber("defaultWarn", 10);
        this.defaultMoist = appSettings.getNumber("defaultMoist", 30);
    }

    onDrawerButtonTap(): void {
        const sideDrawer = <RadSideDrawer>app.getRootView();
        sideDrawer.showDrawer();
    }

    moistchange(val: number): void {
        this.defaultMoist = val;
        appSettings.setNumber("defaultMoist", this.defaultMoist);
    }
    warnchange(val: number): void {
        this.defaultWarn = val;
        appSettings.setNumber("defaultWarn", this.defaultWarn);
    }
}

