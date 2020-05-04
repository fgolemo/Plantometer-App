import { Injectable } from "@angular/core";
import { Sensor } from "~/app/home/sensor";
import * as appSettings from "tns-core-modules/application-settings";
import { Reading } from "~/app/sensor/reading";

@Injectable({
    providedIn: "root"
})
export class FbService {

    static result2Reading(result) {
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
        console.log("reading: " + JSON.stringify(reading));

        return reading;
    }
    private gardens: any;
    private fb: any;
    private sensors: Array<Sensor>;

    setup(fb) {
        this.fb = fb;
    }

    getGardens() {
        return this.fb.getValue("/gardens")
            .then((result) => {
                console.log(JSON.stringify(result.value));
                this.gardens = result.value;

                return result.value;
            })
            .catch((error) => console.log("Error: " + error));
    }

    getSensors(garden) {
        this.sensors = new Array<Sensor>();

        return this.fb.getValue(`/${garden}/sensors`)
            .then((result) => {
                result.value.forEach((val) => {
                    if (!this.sensors.some((e) => e.id === val)) {
                        const settingPath = `${garden}-${val}`;
                        const name = appSettings.getString(settingPath, `Sensor ${val}`);
                        const moistValue = appSettings.getNumber(`${settingPath}-moistValue`, appSettings.getNumber("defaultMoist", 30));
                        const warnValue = appSettings.getNumber(`${settingPath}-warnValue`, appSettings.getNumber("defaultWarn", 10));
                        const maxGauge = appSettings.getNumber(`${settingPath}-maxGauge`, 1024);
                        this.sensors.push(new Sensor(val, name, moistValue, warnValue, maxGauge));
                    }
                });

                return this.sensors;
            })
            .catch((error) => console.log("Error: " + error));
    }

    getSensorUpdating(garden, sensor, callback) {
        console.log("querying:" + `/${garden}/${sensor}`);
        this.fb.query(
            callback,
            `/${garden}/${sensor}`,
            {
                // singleEvent: true,
                orderBy: {
                    type: this.fb.QueryOrderByType.CHILD,
                    value: "timestamp" // mandatory when type is 'child'
                },
                limit: {
                    type: this.fb.QueryLimitType.LAST,
                    value: 1
                }
            }
        );
    }
}
