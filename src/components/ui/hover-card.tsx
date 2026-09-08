import { Popover as HoverCardPrimitive } from '@base-ui/react/popover';
import type { ComponentProps } from 'react';
import { cn } from 'cn';

const HoverCard = HoverCardPrimitive.Root;
const HoverCardTrigger = HoverCardPrimitive.Trigger;

function HoverCardContent({
	className,
	...props
}: ComponentProps<typeof HoverCardPrimitive.Popup>) {
	return (
		<HoverCardPrimitive.Portal>
			<HoverCardPrimitive.Positioner sideOffset={4}>
				<HoverCardPrimitive.Popup
					className={cn(
						'z-50 w-64 rounded-md border bg-popover p-3 text-sm text-popover-foreground shadow-md outline-none',
						className
					)}
					{...props}
				/>
			</HoverCardPrimitive.Positioner>
		</HoverCardPrimitive.Portal>
	);
}

export { HoverCard, HoverCardContent, HoverCardTrigger };
