// src/components/InfoBar.tsx
interface Props {
	user: string;
	rev: number;
	pendingCount?: number;
	connected?: boolean;
}
export default function InfoBar({ user, rev, pendingCount = 0, connected = false }: Props) {
	return (
		<div className="bg-gray-100 px-4 py-2 text-sm flex justify-between border-b">
			<span>User: {user}</span>
			<span>Revision: {rev}</span>
			<span>{connected ? "Connected" : "Disconnected"}</span>
			<span>Pending: {pendingCount}</span>
		</div>
	);
}

