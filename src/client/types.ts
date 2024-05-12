export interface ConfigSchema {
    buttons: Record<string, number>;
    activeState: 0 | 1;
    actions: Action[];
}

export interface Action {
    name: string;
    trigger: Trigger;
    sequence: ActionSequence[];
}

export interface ActionSequence {
    action: string;
    value: number;
}

export interface Trigger {
    button: string;
    value: number | null;
}

export interface TriggerValue {
    value: number;
    actionIndex: number;
}