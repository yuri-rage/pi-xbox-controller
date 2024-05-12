import { computed, effect, signal } from '@preact/signals-react';
import io from 'socket.io-client';
import { ConfigSchema, TriggerValue } from '@/types';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Card, CardContent } from '@/components/ui/card';
import { GameButton } from '@/components/ui/GameButton';
import { PadButton } from '@/components/ui/PadButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { ActionMenu } from '@/components/ui/ActionMenu';
import { AddNewButton } from '@/components/ui/AddNewButton';
import { Label } from '@/components/ui/label';
import { TriggerMenu } from '@/components/ui/TriggerMenu';
import { Progress } from './components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

// controller PCB scan:
// https://acidmods.com/forum/index.php/topic,43981.0.html

// const originRoot = window.location.origin.split(':').slice(0, 2).join(':');
// const socket = io(`${originRoot}:3000`);
const socket = io(); // use root origin
const cfg = signal({} as ConfigSchema);
const activeTriggers = signal<Set<number>>(new Set());
const lastPressed = signal('');
const selectedAction = signal(0);
const repeatNum = signal(0);
const actionProgress = signal(0);
const actionTotal = signal(0);
const actionPercent = computed(() => {
    const percent = (actionProgress.value / actionTotal.value) * 100;
    return percent ? Math.round(percent * 10) / 10 : 0;
});

effect(() => {
    socket.on('config', (data: ConfigSchema) => {
        cfg.value = data;
    });
    socket.on('activeTriggers', (data: Set<number>) => {
        activeTriggers.value = new Set(data);
    });
    socket.emit('getConfig');
    socket.emit('getActiveTriggers');

    socket.on('button', (button: string, value: number) => {
        lastPressed.value = value === cfg.value.activeState ? button : '';
    });

    socket.on('configSaved', () => {
        toast.success('Configuration saved');
    });

    socket.on('actionProgress', (progress: number, total: number) => {
        actionProgress.value = progress;
        actionTotal.value = total;
    });

    socket.on('actionComplete', (success: boolean) => {
        if (success) {
            toast.success('Action complete!');
        } else {
            toast.error('Action failed');
            actionProgress.value = 0;
            actionTotal.value = 0;
        }
        actionProgress.value = actionTotal.value;
        setTimeout(() => {
            actionProgress.value = 0;
            actionTotal.value = 0;
        }, 3000);
    });

    socket.on('actionRefused', () => {
        toast.error('Action refused');
    });
});

function App() {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            {Object.keys(cfg.value).length === 0 ? null : (
                <div className="grid place-items-center">
                    <div className="p-3">
                        <Card className="inline-block rounded-3xl pt-4">
                            {/*** Trigger/Shoulder Buttons ***/}
                            <CardContent className="flex items-center justify-between px-3">
                                <div className="flex gap-1">
                                    <GameButton
                                        variant="outline"
                                        className="w-10 rounded-tl-2xl text-red-800 hover:text-red-600"
                                        onPress={() => socket.emit('buttonDown', 'TriggerL')}
                                        onRelease={() => socket.emit('buttonUp', 'TriggerL')}
                                    >
                                        LT
                                    </GameButton>
                                    <GameButton
                                        variant="outline"
                                        className="h-5 w-24 text-zinc-700"
                                        onPress={() => socket.emit('buttonDown', 'LB')}
                                        onRelease={() => socket.emit('buttonUp', 'LB')}
                                    >
                                        LB
                                    </GameButton>
                                </div>
                                <div className="h-8 text-sm text-zinc-600">{lastPressed.value}</div>
                                <div className="flex gap-1">
                                    <GameButton
                                        variant="outline"
                                        className="h-5 w-24 text-zinc-700"
                                        onPress={() => socket.emit('buttonDown', 'RB')}
                                        onRelease={() => socket.emit('buttonUp', 'RB')}
                                    >
                                        RB
                                    </GameButton>
                                    <GameButton
                                        variant="outline"
                                        className="w-10 rounded-tr-2xl text-red-800 hover:text-red-600"
                                        onPress={() => socket.emit('buttonDown', 'TriggerR')}
                                        onRelease={() => socket.emit('buttonUp', 'TriggerR')}
                                    >
                                        RT
                                    </GameButton>
                                </div>
                            </CardContent>

                            <div className="flex">
                                {/*** D-Pad ***/}
                                <CardContent className="flex items-center justify-between">
                                    <div className="grid grid-cols-3 grid-rows-3 gap-1">
                                        <PadButton
                                            variant="up"
                                            onPress={() => socket.emit('buttonDown', 'DpadU')}
                                            onRelease={() => socket.emit('buttonUp', 'DpadU')}
                                        />
                                        <PadButton
                                            variant="left"
                                            onPress={() => socket.emit('buttonDown', 'DpadL')}
                                            onRelease={() => socket.emit('buttonUp', 'DpadL')}
                                        />
                                        <PadButton
                                            variant="down"
                                            onPress={() => socket.emit('buttonDown', 'DpadD')}
                                            onRelease={() => socket.emit('buttonUp', 'DpadD')}
                                        />
                                        <PadButton
                                            variant="right"
                                            onPress={() => socket.emit('buttonDown', 'DpadR')}
                                            onRelease={() => socket.emit('buttonUp', 'DpadR')}
                                        />
                                    </div>
                                </CardContent>

                                {/*** View/Menu ***/}
                                <CardContent className="flex justify-center space-x-4 px-0 pt-4">
                                    <GameButton
                                        variant="outline"
                                        size="sm"
                                        className="aspect-square rounded-full text-zinc-700"
                                        onPress={() => socket.emit('buttonDown', 'View')}
                                        onRelease={() => socket.emit('buttonUp', 'View')}
                                    >
                                        &#10697;
                                    </GameButton>
                                    <GameButton
                                        variant="outline"
                                        size="sm"
                                        className="aspect-square rounded-full text-zinc-700"
                                        onPress={() => socket.emit('buttonDown', 'Menu')}
                                        onRelease={() => socket.emit('buttonUp', 'Menu')}
                                    >
                                        &#8801;
                                    </GameButton>
                                </CardContent>

                                {/*** Buttons ***/}
                                <CardContent className="flex items-center justify-center">
                                    <div className="grid grid-cols-3 grid-rows-3 gap-0">
                                        <div className="col-start-2 row-start-1 flex justify-center">
                                            <GameButton
                                                variant="outline"
                                                className="aspect-square rounded-full font-bold text-yellow-500 hover:text-yellow-400"
                                                onPress={() => socket.emit('buttonDown', 'Y')}
                                                onRelease={() => socket.emit('buttonUp', 'Y')}
                                            >
                                                Y
                                            </GameButton>
                                        </div>
                                        <div className="col-start-1 row-start-2 flex justify-end">
                                            <GameButton
                                                variant="outline"
                                                className="aspect-square rounded-full font-bold text-blue-500 hover:text-blue-400"
                                                onPress={() => socket.emit('buttonDown', 'X')}
                                                onRelease={() => socket.emit('buttonUp', 'X')}
                                            >
                                                X
                                            </GameButton>
                                        </div>
                                        <div className="col-start-2 row-start-3 flex justify-center">
                                            <GameButton
                                                variant="outline"
                                                className="aspect-square rounded-full font-bold text-green-500 hover:text-green-400"
                                                onPress={() => socket.emit('buttonDown', 'A')}
                                                onRelease={() => socket.emit('buttonUp', 'A')}
                                            >
                                                A
                                            </GameButton>
                                        </div>
                                        <div className="col-start-3 row-start-2 flex justify-start">
                                            <GameButton
                                                variant="outline"
                                                className="aspect-square rounded-full font-bold text-red-500 hover:text-red-400"
                                                onPress={() => socket.emit('buttonDown', 'B')}
                                                onRelease={() => socket.emit('buttonUp', 'B')}
                                            >
                                                B
                                            </GameButton>
                                        </div>
                                    </div>
                                </CardContent>
                            </div>
                        </Card>
                    </div>

                    {/*** Actions ***/}
                    <div className="p-3">
                        <Card className="inline-block pt-4">
                            <CardContent className="flex-col items-center space-y-3">
                                <div className="flex items-center gap-2">
                                    <Select
                                        value={selectedAction.value.toString()}
                                        onValueChange={(value) => (selectedAction.value = parseInt(value))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Action" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {cfg.value.actions.map((action, index) => (
                                                    <SelectItem key={index} value={index.toString()}>
                                                        {action.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        variant="ghost"
                                        className="aspect-square h-6 p-3 font-mono text-xl font-bold text-red-700"
                                        onClick={() => {
                                            if (cfg) {
                                                cfg.value.actions.splice(selectedAction.value, 1);
                                                selectedAction.value--;
                                                cfg.value = { ...cfg.value };
                                            }
                                        }}
                                    >
                                        x
                                    </Button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <TriggerMenu cfg={cfg} actionIndex={selectedAction.value} />
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger
                                                className="cursor-pointer"
                                                onMouseDown={(event) => {
                                                    if (event.detail > 1) event.preventDefault();
                                                }}
                                                onDoubleClick={() => {
                                                    cfg.value.actions[selectedAction.value].trigger.button =
                                                        '';
                                                    cfg.value.actions[selectedAction.value].trigger.value =
                                                        null;
                                                    cfg.value = { ...cfg.value };
                                                }}
                                            >
                                                then
                                            </TooltipTrigger>
                                            <TooltipContent>Double click to clear trigger selections</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <Card className="border-indigo-500 p-3">
                                    <CardContent className="flex-col items-center space-y-2 p-0">
                                        {cfg.value.actions[selectedAction.value].sequence.map(
                                            (_step, index) => (
                                                <ActionMenu
                                                    key={index}
                                                    cfg={cfg}
                                                    actionIndex={selectedAction.value}
                                                    sequenceIndex={index}
                                                />
                                            ),
                                        )}
                                        <Button
                                            variant="ghost"
                                            className="aspect-square h-6 w-6 p-3 text-xl font-bold"
                                            onClick={() => {
                                                cfg.value.actions[selectedAction.value].sequence.push({
                                                    action: 'delay',
                                                    value: 0,
                                                });
                                                cfg.value = { ...cfg.value };
                                            }}
                                        >
                                            +
                                        </Button>
                                    </CardContent>
                                </Card>
                                <div className="space-y-4">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger className="w-full">
                                                <Progress value={actionPercent.value} />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                {actionTotal.value > 0 ? (
                                                    <>
                                                        {actionProgress} / {actionTotal} (
                                                        {actionPercent.value}
                                                        %)
                                                    </>
                                                ) : (
                                                    'No action running'
                                                )}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => {
                                                actionProgress.value = 0;
                                                const repeat = repeatNum.value === 0 ? 1 : repeatNum.value;
                                                console.log(repeat);
                                                socket.emit('saveConfig', cfg.value);
                                                socket.emit('execute', selectedAction.value, repeat);
                                            }}
                                        >
                                            Execute Now
                                        </Button>
                                        <Input
                                            type="number"
                                            className="flex-1"
                                            placeholder="Repeat"
                                            value={repeatNum.value === 0 ? '' : repeatNum.value?.toString()}
                                            onChange={(event) =>
                                                (repeatNum.value = event.target.value
                                                    ? parseInt(event.target.value)
                                                    : 0)
                                            }
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger className="flex flex-1 items-center gap-2">
                                                    <Switch
                                                        id="trigger-enable"
                                                        checked={activeTriggers.value.has(
                                                            selectedAction.value,
                                                        )}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                if (
                                                                    !cfg.value.actions[selectedAction.value]
                                                                        .trigger.button ||
                                                                    cfg.value.actions[selectedAction.value]
                                                                        .trigger.value === null
                                                                ) {
                                                                    toast.error(
                                                                        'Must specify a button to use as a trigger',
                                                                    );
                                                                    return;
                                                                }
                                                                cfg.value = { ...cfg.value };
                                                                socket.emit('saveConfig', cfg.value);
                                                                activeTriggers.value.add(
                                                                    selectedAction.value,
                                                                );
                                                                activeTriggers.value = new Set(
                                                                    activeTriggers.value,
                                                                );
                                                            } else {
                                                                activeTriggers.value.delete(
                                                                    selectedAction.value,
                                                                );
                                                                activeTriggers.value = new Set(
                                                                    activeTriggers.value,
                                                                );
                                                            }
                                                            socket.emit(
                                                                'setActiveTriggers',
                                                                Array.from(activeTriggers.value),
                                                            );
                                                        }}
                                                    />
                                                    <Label htmlFor="trigger-enable">Enable Trigger</Label>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    Execute this action when the button (in the "then" line
                                                    above) is pressed/released.
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                        <div className="flex-1">
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                                onClick={() => {
                                                    activeTriggers.value = new Set();
                                                    socket.emit('setActiveTriggers', []);
                                                }}
                                            >
                                                Clear All Triggers
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <AddNewButton
                                            cfg={cfg}
                                            onAdd={() => {
                                                selectedAction.value = cfg.value.actions.length - 1;
                                                socket.emit('saveConfig', cfg.value);
                                            }}
                                            variant="outline"
                                            className="flex-1 text-white"
                                        >
                                            Add New
                                        </AddNewButton>
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => socket.emit('saveConfig', cfg.value)}
                                        >
                                            Save Configuration
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Toaster />
                </div>
            )}
        </ThemeProvider>
    );
}

export default App;
