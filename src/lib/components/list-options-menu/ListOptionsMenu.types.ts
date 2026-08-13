export type ListOptionsMenuProps = {
	noRepeat: boolean;
	onToggleNoRepeat: (enabled: boolean) => void;
	onClear?: () => void;
	onOpenPresets?: () => void;
};
