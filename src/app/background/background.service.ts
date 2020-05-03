import { Injectable } from "@angular/core";
import { BackgroundFetch } from "nativescript-background-fetch";
import { LocalNotifications } from "nativescript-local-notifications";
import { Color } from "@nativescript/core/color/color";

@Injectable({
    providedIn: "root"
})
export class BackgroundService {
    garden = "";
    sensors = [];
    plantThristy = "TEST";
    private _counter: number;
    private _fetchManager: BackgroundFetch;

    constructor() {

        BackgroundFetch.configure({
            minimumFetchInterval: 1,
            stopOnTerminate: false,
            startOnBoot: true,
            enableHeadless: true
        }, function() {
            console.log("[BackgroundFetch] Event Received!");
            this._counter++;
            this.queryAllPlants();
            this.showNotification();
            BackgroundFetch.finish(BackgroundFetch.FETCH_RESULT_NEW_DATA);
        }.bind(this), function(error) {
            console.log("[BackgroundFetch] FAILED");
        }.bind(this));

        // Initialize default values.
        this._counter = 0;
        this.queryAllPlants();

    }

    queryAllPlants() {
        // TODO check all plants, return list of thirsty ones.
        console.log("BGS updating querying all plants");

        this.plantThristy = this._counter + " plant is thirsty";
    }

    showNotification() {
        LocalNotifications.schedule([{
            // id: 1, // generated id if not set
            title: "The title",
            body: "Recurs every minute until cancelled",
            ticker: "The ticker",
            color: new Color("red"),
            badge: 1,
            icon: "res://heart",
            image: "https://cdn-images-1.medium.com/max/1200/1*c3cQvYJrVezv_Az0CoDcbA.jpeg",
            thumbnail: true,
            // interval: 'minute',
            channel: "My Channel", // default: 'Channel'
            at: new Date(new Date().getTime() + (3 * 1000)) // 10 seconds from now
        }]).then(
            (scheduledIds) => {
                console.log("Notification id(s) scheduled: " + JSON.stringify(scheduledIds));
            },
            (error) => {
                console.log("scheduling error: " + error);
            }
        );
        LocalNotifications.addOnMessageReceivedCallback(
            (notification) => {
                console.log("ID: " + notification.id);
                console.log("Title: " + notification.title);
                console.log("Body: " + notification.body);
            }
        ).then(
            () => {
                console.log("Listener added");
            }
        );

    }

    getThirst() {
        return this.plantThristy;
    }
}
