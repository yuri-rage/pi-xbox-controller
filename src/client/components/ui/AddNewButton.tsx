import React from 'react';
import { useSignals } from '@preact/signals-react/runtime';
import { Signal, useSignal } from '@preact/signals-react';
import { cn } from '@/lib/utils';
import { ConfigSchema } from '@/types';
import { type VariantProps } from 'class-variance-authority';
import { Button, buttonVariants } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddNewButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    cfg?: Signal<ConfigSchema>;
    onAdd?: () => void;
}

export const AddNewButton = React.forwardRef<HTMLButtonElement, AddNewButtonProps>(
    ({ className, variant, size, cfg, onAdd, ...props }, ref) => {
        useSignals(); // ! bit of a workaround for signals to work with forwardRef
        const newName = useSignal('');

        return (
            <Dialog>
                <DialogTrigger asChild>
                    <Button
                        className={cn(buttonVariants({ variant, size, className }))}
                        ref={ref}
                        {...props}
                    />
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>New Action</DialogTitle>
                        <DialogDescription>
                            Adds a new action to the controller configuration.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center gap-2">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            placeholder="New Action"
                            value={newName.value}
                            onInput={(event: React.ChangeEvent<HTMLInputElement>) =>
                                (newName.value = event.target.value)
                            }
                        />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    if (cfg && newName.value) {
                                        cfg.value.actions.push({
                                            name: newName.value,
                                            trigger: { button: '', value: null },
                                            sequence: [],
                                        });
                                        cfg.value = { ...cfg.value };
                                        onAdd?.();
                                        newName.value = '';
                                    }
                                }}
                            >
                                Accept
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    },
);
