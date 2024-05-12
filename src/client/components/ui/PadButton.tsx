import React from 'react';
import { cn } from '@/lib/utils';
import { useSignal } from '@preact/signals-react';

const variants = {
    up: {
        text: 'U',
        outer: 'col-start-2 row-start-1 flex cursor-pointer justify-center',
        inner: 'relative flex h-9 w-8 items-top justify-center rounded-sm border-x border-t text-zinc-700',
        arrow: 'absolute bottom-0 left-1/2 h-5 w-5 -translate-x-1/2 translate-y-[46%] -rotate-45 transform border-b border-l',
    },
    down: {
        text: 'D',
        outer: 'col-start-2 row-start-3 flex cursor-pointer justify-center',
        inner: 'relative flex h-9 w-8 items-end justify-center rounded-sm border-x border-b text-zinc-700',
        arrow: 'absolute left-1/2 top-0 h-5 w-5 -translate-x-1/2 -translate-y-[46%] -rotate-45 transform border-r border-t',
    },
    left: {
        text: 'L',
        outer: 'col-start-1 row-start-2 flex cursor-pointer justify-end',
        inner: 'relative flex h-8 w-9 items-center justify-start px-2 rounded-sm border-y border-l text-zinc-700',
        arrow: 'absolute right-0 top-1/2 h-5 w-5 -translate-y-1/2 translate-x-[46%] rotate-45 transform border-r border-t',
    },
    right: {
        text: 'R',
        outer: 'col-start-3 row-start-2 flex cursor-pointer justify-start',
        inner: 'relative flex h-8 w-9 items-center justify-end px-2 rounded-sm border-y border-r text-zinc-700',
        arrow: 'absolute left-0 top-1/2 h-5 w-5 -translate-x-[46%] -translate-y-1/2 rotate-45 transform border-b border-l',
    },
};

interface PadButtonProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: keyof typeof variants;
    onPress?: () => void;
    onRelease?: () => void;
}

export const PadButton: React.FC<PadButtonProps> = ({ variant, onPress, onRelease, ...props }) => {
    const isPressed = useSignal(false);
    const isHovered = useSignal(false);

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
        <div
            className={variants[variant ?? 'up'].outer}
            onMouseEnter={() => (isHovered.value = true)}
            onMouseDown={() => doPress()}
            onTouchStart={() => doPress()}
            onMouseUp={() => doRelease()}
            onMouseLeave={() => {
                isHovered.value = false;
                doRelease();
            }}
            onTouchEnd={() => {
                isHovered.value = false;
                doRelease();
            }}
            onBlur={() => {
                isHovered.value = false;
                doRelease();
            }}
            {...props}
        >
            <div
                className={cn(
                    variants[variant ?? 'up'].inner,
                    isHovered.value ? 'text-bold bg-zinc-800 text-white' : '',
                )}
            >
                <span>{variants[variant ?? 'up'].text}</span>
                <div
                    className={cn(variants[variant ?? 'up'].arrow, isHovered.value ? 'bg-zinc-800' : '')}
                ></div>
            </div>
        </div>
    );
};
