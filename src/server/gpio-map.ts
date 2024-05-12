import fs from 'fs';

export const isPi5 = () => {
    const modelPath = '/proc/device-tree/model';
    try {
        if (fs.existsSync(modelPath)) {
            const model = fs.readFileSync(modelPath, 'utf8').trim();
            return model.includes('Pi 5');
        }
        console.error('Device tree model file not found.');
        return false;
    } catch (err) {
        console.error('Error reading device tree model file:', err);
        return false;
    }
};

export const PIN_MAP = new Map(
    Object.entries({
        // GPIO# : PIN#
        2: 3, // GPIO2 (SDA)
        3: 5, // GPIO3 (SCL)
        4: 7, // GPIO4 (GPCLK0)
        5: 29, // GPIO5
        6: 31, // GPIO6
        7: 26, // GPIO7
        8: 24, // GPIO8
        9: 21, // GPIO9
        10: 19, // GPIO10
        11: 23, // GPIO11
        12: 32, // GPIO12
        13: 33, // GPIO13
        14: 8, // GPIO14 (TXD)
        15: 10, // GPIO15 (RXD)
        16: 36, // GPIO16
        17: 11, // GPIO17
        18: 12, // GPIO18
        19: 35, // GPIO19
        20: 38, // GPIO20
        21: 40, // GPIO21
        22: 15, // GPIO22
        23: 16, // GPIO23
        24: 18, // GPIO24
        25: 22, // GPIO25
        26: 37, // GPIO26
        27: 13, // GPIO27
    }),
);

export const FUNCTION_MAP = new Map(
    Object.entries({
        // PIN# : Function
        3: 'GPIO2 (SDA)',
        5: 'GPIO3 (SCL)',
        7: 'GPIO4 (GPCLK0)',
        29: 'GPIO5',
        31: 'GPIO6',
        26: 'GPIO7',
        24: 'GPIO8',
        21: 'GPIO9',
        19: 'GPIO10',
        23: 'GPIO11',
        32: 'GPIO12',
        33: 'GPIO13',
        8: 'GPIO14 (TXD)',
        10: 'GPIO15 (RXD)',
        36: 'GPIO16',
        11: 'GPIO17',
        12: 'GPIO18',
        35: 'GPIO19',
        38: 'GPIO20',
        40: 'GPIO21',
        15: 'GPIO22',
        16: 'GPIO23',
        18: 'GPIO24',
        22: 'GPIO25',
        37: 'GPIO26',
        13: 'GPIO27',
    }),
);

export const PI5_CHIP = 4;

export const PI5_MAP = new Map(
    Object.entries({
        // GPIO# : Kernel#
        2: 401, // GPIO2 (SDA)
        3: 402, // GPIO3 (SCL)
        4: 403, // GPIO4 (GPCLK0)
        5: 404, // GPIO5
        6: 405, // GPIO6
        7: 406, // GPIO7
        8: 407, // GPIO8
        9: 408, // GPIO9
        10: 409, // GPIO10
        11: 410, // GPIO11
        12: 411, // GPIO12
        13: 412, // GPIO13
        14: 413, // GPIO14 (TXD)
        15: 414, // GPIO15 (RXD)
        16: 415, // GPIO16
        17: 416, // GPIO17
        18: 417, // GPIO18
        19: 418, // GPIO19
        20: 419, // GPIO20
        21: 420, // GPIO21
        22: 421, // GPIO22
        23: 422, // GPIO23
        24: 423, // GPIO24
        25: 424, // GPIO25
        26: 425, // GPIO26
        27: 426, // GPIO27
    }),
);

export const PI_CHIP = 0;

export const PI_MAP = new Map(
    Object.entries({
        // GPIO# : Kernel#
        2: 514, // GPIO2 (SDA)
        3: 515, // GPIO3 (SCL)
        4: 516, // GPIO4 (GPCLK0)
        5: 517, // GPIO5
        6: 518, // GPIO6
        7: 519, // GPIO7
        8: 520, // GPIO8
        9: 521, // GPIO9
        10: 522, // GPIO10
        11: 523, // GPIO11
        12: 524, // GPIO12
        13: 525, // GPIO13
        14: 526, // GPIO14 (TXD)
        15: 527, // GPIO15 (RXD)
        16: 528, // GPIO16
        17: 529, // GPIO17
        18: 530, // GPIO18
        19: 531, // GPIO19
        20: 532, // GPIO20
        21: 533, // GPIO21
        22: 534, // GPIO22
        23: 535, // GPIO23
        24: 536, // GPIO24
        25: 537, // GPIO25
        26: 538, // GPIO26
        27: 539, // GPIO27
    }),
);

export class Pins {
    private _isPi5: boolean;
    constructor() {
        this._isPi5 = isPi5();
    }
    public get isPi5() {
        return this._isPi5;
    }
    public GPIO(num: number) {
        return this._isPi5 ? PI5_MAP.get(num.toString()) : PI_MAP.get(num.toString());
    }
    public get MAP() {
        return this._isPi5 ? PI5_MAP : PI_MAP;
    }
    public get GPIO2() {
        return this.GPIO(2);
    }
    public get GPIO3() {
        return this.GPIO(3);
    }
    public get GPIO4() {
        return this.GPIO(4);
    }
    public get GPIO5() {
        return this.GPIO(5);
    }
    public get GPIO6() {
        return this.GPIO(6);
    }
    public get GPIO7() {
        return this.GPIO(7);
    }
    public get GPIO8() {
        return this.GPIO(8);
    }
    public get GPIO9() {
        return this.GPIO(9);
    }
    public get GPIO10() {
        return this.GPIO(10);
    }
    public get GPIO11() {
        return this.GPIO(11);
    }
    public get GPIO12() {
        return this.GPIO(12);
    }
    public get GPIO13() {
        return this.GPIO(13);
    }
    public get GPIO14() {
        return this.GPIO(14);
    }
    public get GPIO15() {
        return this.GPIO(15);
    }
    public get GPIO16() {
        return this.GPIO(16);
    }
    public get GPIO17() {
        return this.GPIO(17);
    }
    public get GPIO18() {
        return this.GPIO(18);
    }
    public get GPIO19() {
        return this.GPIO(19);
    }
    public get GPIO20() {
        return this.GPIO(20);
    }
    public get GPIO21() {
        return this.GPIO(21);
    }
    public get GPIO22() {
        return this.GPIO(22);
    }
    public get GPIO23() {
        return this.GPIO(23);
    }
    public get GPIO24() {
        return this.GPIO(24);
    }
    public get GPIO25() {
        return this.GPIO(25);
    }
    public get GPIO26() {
        return this.GPIO(26);
    }
    public get GPIO27() {
        return this.GPIO(27);
    }
}

export const PINS = new Pins();
export const GPIO = (num: number) => PINS.GPIO(num);
