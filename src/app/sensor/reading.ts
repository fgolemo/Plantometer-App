export class PlotReading {
    constructor(public timeStamp: number, public amount: number) {
    }
}

export interface Reading {
    sensor: number;
    timestamp: number;
    moisture: number;
}
