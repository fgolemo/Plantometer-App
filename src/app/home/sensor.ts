export class Sensor {
    constructor(public id: number,
                public name: string,
                public moistValue: number,
                public warnValue: number,
                public maxGauge: number) {
    }
}
