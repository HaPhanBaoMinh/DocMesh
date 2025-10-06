interface Props {
	value: string;
	onChange: (v: string) => void;
}

export default function Editor({ value, onChange }: Props) {
	return (
		<textarea
			value={value}
			onChange={(e) => onChange(e.target.value)}
			placeholder="Start typing..."
			className="flex-1 w-full p-4 text-base border-none outline-none resize-none font-mono"
		/>
	);
}

