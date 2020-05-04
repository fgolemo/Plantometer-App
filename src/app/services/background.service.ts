import { Injectable } from "@angular/core";
import { BackgroundFetch } from "nativescript-background-fetch";
import { LocalNotifications } from "nativescript-local-notifications";
import { Color } from "@nativescript/core/color/color";
import { FbService } from "~/app/services/fb.service";
import * as appSettings from "tns-core-modules/application-settings";

@Injectable({
    providedIn: "root"
})
export class BackgroundService {
    private _fetchManager: BackgroundFetch;
    private _garden: any;

    constructor(private _fb: FbService) {

        BackgroundFetch.configure({
            minimumFetchInterval: 15,
            stopOnTerminate: false,
            startOnBoot: true,
            enableHeadless: false,
            forceReload: true
        }, () => {
            console.log("[BackgroundFetch] Event Received!");
            this.queryAllPlants();
            BackgroundFetch.finish(BackgroundFetch.FETCH_RESULT_NEW_DATA);
        }, (error) => {
            console.log("[BackgroundFetch] FAILED");
            console.log(error);
        });

        // Initialize default values.
        this.queryAllPlants();

    }

    setGarden(garden) {
        this._garden = garden;
    }

    queryAllPlants() {
        if (!this._garden) {
            this._garden = appSettings.getString("lastGarden");
        }

        console.log("querying plants. garden:" + this._garden);
        this._fb.checkAllSensors(this._garden, (sensor) => {
            console.log("found problematic plant:", sensor);
            this.showNotification(sensor);
        });
        // this.showNotification("ladeeda");
    }

    showNotification(sensor) {
        LocalNotifications.schedule([{
            // id: 1, // generated id if not set
            title: "Thirsty Plant Alert",
            body: `${sensor} needs water`,
            // ticker: "The ticker",
            color: new Color("DarkGreen"),
            badge: 1,
            icon: "res://heart",
            // image: "https://cdn-images-1.medium.com/max/1200/1*c3cQvYJrVezv_Az0CoDcbA.jpeg",
            // thumbnail: true,
            // interval: 'minute',
            channel: "My Channel", // default: 'Channel'
            // at: new Date(new Date().getTime() + (3 * 1000)) // 3 seconds from now
            at: new Date(new Date().getTime() + (100)) // 3 seconds from now
        }]).then(
            (scheduledIds) => {
                console.log("Notification id(s) scheduled: " + JSON.stringify(scheduledIds));
            },
            (error) => {
                console.log("scheduling error: " + error);
            }
        );
        // LocalNotifications.addOnMessageReceivedCallback(
        //     (notification) => {
        //         console.log("ID: " + notification.id);
        //         console.log("Title: " + notification.title);
        //         console.log("Body: " + notification.body);
        //     }
        // ).then(
        //     () => {
        //         console.log("Listener added");
        //     }
        // );

    }
}
