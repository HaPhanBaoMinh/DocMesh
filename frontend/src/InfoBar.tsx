interface Props {
	user: string;
	rev: number;
}

export default function InfoBar({ user, rev }: Props) {
	return (
		<div className="bg-gray-100 px-4 py-2 text-sm flex justify-between border-b border-gray-200">
			<span>User: {user}</span>
			<span>Revision: {rev}</span>
		</div>
	);
}

