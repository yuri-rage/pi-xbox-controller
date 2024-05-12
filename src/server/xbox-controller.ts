import { EventEmitter } from 'eventemitter3';
import fs from 'fs';
import config from 'config';
import OnOff from 'onoff';
import { GPIO } from './gpio-map.js';
import { ConfigSchema, TriggerValue } from '@/types.js';

const timeoutPromise = (operation: () => void, timeout: number): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
            try {
                operation();
                resolve();
            } catch (error) {
                reject(error);
            }
        }, timeout);
    });
};

const delay = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

const Gpio = OnOff.Gpio;
export class XboxController extends EventEmitter {
    private _cfg = config.util.toObject() as ConfigSchema;
    private _pins = new Map<string, OnOff.Gpio>();
    private _actionRunning = false;
    private _activeTriggers = new Map<string, TriggerValue>();

    constructor() {
        super();
        for (const [key, value] of Object.entries(this._cfg.buttons)) {
            const num = GPIO(value as number);
            if (num) {
                try {
                    const pin = new Gpio(num, 'in', 'both');
                    this._pins.set(key, pin);
                    // xbox triggers are analog and unnecessarily emit a lot of events
                    // we can still emulate a full trigger press by pulling the pin low
                    if (!key.includes('Trigger')) {
                        pin.watch((err, value) => {
                            if (err) {
                                console.error(`Error watching button ${key}:`, err);
                                return;
                            }
                            if (pin.direction() === 'in') {
                                // not to be confused with the physical triggers
                                // action triggers are attached to button listeners and
                                // execute actions when buttons are pressed/released
                                // they cannot be attached to the physical triggers because
                                // of the hardware limitation commented above
                                console.log(
                                    `Button ${key} ${value === this._cfg.activeState ? 'pressed' : 'released'}`,
                                );
                                const trigger = this._activeTriggers.get(key);
                                if (trigger !== undefined && trigger.value === value) {
                                    console.log(`Executing ${this._cfg.actions[trigger.actionIndex].name}`);
                                    this.executeAction(trigger.actionIndex, 1);
                                }
                                this.emit('button', key, value);
                            }
                        });
                    }
                    continue;
                } catch (err) {
                    console.error(`Error initializing GPIO ${value}: ${err}`);
                    continue;
                }
            }
            console.error(`Invalid GPIO pin number for button ${key}`);
        }
    }

    public get configObject() {
        return this._cfg;
    }

    public set configObject(data: any) {
        this._cfg = { ...data };
    }

    public saveConfig() {
        fs.writeFileSync('config/default.json', JSON.stringify(this._cfg, null, 2));
        this.emit('configSaved');
    }

    public pushButton(button: string) {
        const pin = this._pins.get(button);
        const direction = this._cfg.activeState === 0 ? 'low' : 'high';
        if (pin) {
            pin.setDirection(direction);
        }
    }

    public releaseButton(button: string) {
        const pin = this._pins.get(button);
        const direction = this._cfg.activeState === 0 ? 'high' : 'low';
        if (pin) {
            pin.setDirection(direction);
        }
    }

    public get activeTriggers() {
        const triggers = new Set<number>();
        if (this._activeTriggers instanceof Map) {
            for (const [_key, value] of this._activeTriggers) {
                if (value.value !== null) {
                    triggers.add(value.actionIndex);
                }
            }
        }
        return triggers;
    }

    public set activeTriggers(data: Set<number>) {
        this._activeTriggers = new Map();
        for (const actionIndex of data) {
            this.setTrigger(actionIndex);
        }
    }

    public setTrigger(actionIndex: number) {
        const action = this._cfg.actions[actionIndex];
        if (!action) return;
        if (!action.trigger.button || action.trigger.value === null) return;
        this._activeTriggers.set(action.trigger.button, {
            actionIndex: actionIndex,
            value: action.trigger.value,
        });
    }

    public async executeAction(actionIndex: number, repeat: number = 1) {
        if (this._actionRunning) {
            this.emit('actionRefused');
            return;
        }
        this._actionRunning = true;
        let lastUpdate = Date.now();
        const action = this._cfg.actions[actionIndex];
        if (!action) {
            this.emit('actionComplete', false);
            return;
        }

        const usedPins = new Set<OnOff.Gpio>();

        for (let i = 0; i < repeat; i++) {
            let timeout = 0;
            for (let j = 0; j < action.sequence.length; j++) {
                const step = action.sequence[j];
                if (step.action === 'delay') {
                    timeout += step.value;
                    if (j === action.sequence.length - 1) {
                        await delay(timeout);
                        timeout = 0;
                    }
                } else {
                    const pin = this._pins.get(step.action);
                    if (!pin) continue;
                    usedPins.add(pin);
                    await timeoutPromise(() => {
                        pin.setDirection(step.value === 0 ? 'low' : 'high');
                    }, timeout);
                    timeout = 0;
                }
            }
            if (Date.now() - lastUpdate > 250) {
                this.emit('actionProgress', i, repeat);
                lastUpdate = Date.now();
            }
        }
        usedPins.forEach((pin) => pin.setDirection('in'));
        this.emit('actionComplete', true);
        this._actionRunning = false;
    }

    destroy() {
        for (const pin of this._pins.values()) {
            pin.unexport();
        }
    }
}
