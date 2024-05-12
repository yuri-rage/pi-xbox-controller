import { Signal, useComputed } from '@preact/signals-react';
import { cn } from '@/lib/utils';
import { ConfigSchema } from '@/types';
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

interface ActionMenuProps extends React.HTMLAttributes<HTMLDivElement> {
    cfg?: Signal<ConfigSchema>;
    actionIndex?: number;
    sequenceIndex?: number;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
    cfg,
    actionIndex,
    sequenceIndex,
    className,
    ...props
}) => {
    const pressed = useComputed(() => {
        return cfg?.value.activeState || 0;
    });
    const released = useComputed(() => {
        return pressed.value ^ 1 || 1;
    });

    return (
        <div className={cn('flex items-center space-x-2', className)} {...props}>
            <Select
                value={cfg?.value.actions[actionIndex as number].sequence[sequenceIndex as number].action}
                onValueChange={(value) => {
                    if (cfg) {
                        cfg.value.actions[actionIndex as number].sequence[sequenceIndex as number].action =
                            value;
                        cfg.value = { ...cfg.value };
                    }
                }}
            >
                <SelectTrigger className="w-36">
                    <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectItem key="delay" value="delay">
                            Delay
                        </SelectItem>
                        {Object.entries(cfg?.value.buttons || {}).map(([buttonName, pinNum]) => (
                            <SelectItem key={pinNum} value={buttonName}>
                                {buttonName}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
            {cfg?.value.actions[actionIndex as number].sequence[sequenceIndex as number].action !==
            'delay' ? (
                <Select
                    value={cfg?.value.actions[actionIndex as number].sequence[
                        sequenceIndex as number
                    ].value.toString()}
                    onValueChange={(value) => {
                        if (cfg) {
                            cfg.value.actions[actionIndex as number].sequence[sequenceIndex as number].value =
                                parseInt(value);
                            cfg.value = { ...cfg.value };
                        }
                    }}
                >
                    <SelectTrigger className="w-36">
                        <SelectValue placeholder="State" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem key={pressed.value} value={pressed.value.toString()}>
                                Press
                            </SelectItem>
                            <SelectItem key={released.value} value={released.value.toString()}>
                                Release
                            </SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            ) : (
                <Input
                    className="w-36"
                    type="number"
                    value={cfg?.value.actions[actionIndex as number].sequence[
                        sequenceIndex as number
                    ].value.toString()}
                    onChange={(event) => {
                        if (cfg) {
                            cfg.value.actions[actionIndex as number].sequence[sequenceIndex as number].value =
                                parseInt(event.target.value);
                            cfg.value = { ...cfg.value };
                        }
                    }}
                    placeholder="Delay in ms"
                />
            )}
            <Button
                variant="ghost"
                className="aspect-square h-6 p-3 font-mono text-xl text-red-700"
                onClick={() => {
                    if (cfg) {
                        cfg.value.actions[actionIndex as number].sequence.splice(sequenceIndex as number, 1);
                        cfg.value = { ...cfg.value };
                    }
                }}
            >
                x
            </Button>
        </div>
    );
};
