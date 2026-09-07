import type { FC, HTMLProps } from 'react';
import styles from './styles.module.scss';

export const Select: FC<HTMLProps<HTMLSelectElement>> = (props) => (
	<select
		{...props}
		className={`${styles.customizableSelect}, ${props.className}`}
	/>
);

export const Option: FC<HTMLProps<HTMLOptionElement>> = (props) => (
	<option
		{...props}
		className={`${styles.customizableOption}, ${props.className}`}
	/>
);
