import { Signal, useComputed } from '@preact/signals-react';
import { cn } from '@/lib/utils';
import { ConfigSchema } from '@/types';
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
}

export const TriggerMenu: React.FC<ActionMenuProps> = ({ cfg, actionIndex, className, ...props }) => {
    const pressed = useComputed(() => {
        return cfg?.value.activeState || 0;
    });
    const released = useComputed(() => {
        return pressed.value ^ 1 || 1;
    });

    return (
        <div className={cn('flex items-center space-x-2', className)} {...props}>
            <Select
                value={cfg?.value.actions[actionIndex as number].trigger.button}
                onValueChange={(value) => {
                    if (cfg) {
                        cfg.value.actions[actionIndex as number].trigger.button = value;
                        cfg.value = { ...cfg.value };
                    }
                }}
            >
                <SelectTrigger className="w-36">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {Object.entries(cfg?.value.buttons || {}).map(
                            ([buttonName, pinNum]) =>
                                !buttonName.includes('Trigger') && (
                                    <SelectItem key={pinNum} value={buttonName}>
                                        {buttonName}
                                    </SelectItem>
                                ),
                        )}
                    </SelectGroup>
                </SelectContent>
            </Select>
            <Select
                value={
                    cfg?.value.actions[actionIndex as number].trigger.value !== null
                        ? cfg?.value.actions[actionIndex as number].trigger.value?.toString()
                        : ''
                }
                onValueChange={(value) => {
                    if (cfg) {
                        cfg.value.actions[actionIndex as number].trigger.value = parseInt(value);
                        cfg.value = { ...cfg.value };
                    }
                }}
            >
                <SelectTrigger className="w-36">
                    <SelectValue />
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
        </div>
    );
};
