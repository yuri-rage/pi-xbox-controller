import React from 'react';
import { useSignal } from '@preact/signals-react';
import { cn } from '@/lib/utils';
import { type VariantProps } from 'class-variance-authority';
import { Button, buttonVariants } from '@/components/ui/button';

interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    onPress?: () => void;
    onRelease?: () => void;
}

export const GameButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, onPress, onRelease, ...props }, ref) => {
        const isPressed = useSignal(false);

        const doPress = () => {
            onPress?.();
            isPressed.value = true;
        };

        const doRelease = () => {
            if (isPressed.value) {
                onRelease?.();
                isPressed.value = false;
            }
        };

        return (
            <Button
                className={cn(buttonVariants({ variant, size, className }))}
                onMouseDown={() => doPress()}
                onTouchStart={() => doPress()}
                onMouseUp={() => doRelease()}
                onMouseLeave={() => doRelease()}
                onTouchEnd={() => doRelease()}
                onBlur={() => doRelease()}
                ref={ref}
                {...props}
            />
        );
    },
);
