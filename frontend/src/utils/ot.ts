// src/utils/ot.ts
import type { Operation as Op } from "../model/types";

/**
 * Transform a's ops against single remote op b.
 * Basic index shift rules for linear text.
 */
export function transformOpAgainst(a: Op, b: Op): Op {
	if (a.type === "retain") return a;

	if (b.type === "insert") {
		const bStart = b.pos;
		const bLen = b.text.length;
		if (a.type === "insert") {
			if (a.pos > bStart) return { ...a, pos: a.pos + bLen };
			return a;
		}
		if (a.type === "delete") {
			if (a.pos >= bStart) return { ...a, pos: a.pos + bLen };
			return a;
		}
	}

	if (b.type === "delete") {
		const bStart = b.pos;
		const bEnd = b.pos + b.length;
		if (a.type === "insert") {
			if (a.pos > bStart) return { ...a, pos: Math.max(bStart, a.pos - b.length) };
			return a;
		}
		if (a.type === "delete") {
			if (a.pos >= bEnd) {
				return { ...a, pos: a.pos - b.length };
			}
			if (a.pos >= bStart && a.pos < bEnd) {
				const overlap = Math.min(a.length, bEnd - a.pos);
				return { ...a, pos: bStart, length: a.length - overlap };
			}
			if (a.pos < bStart && a.pos + a.length > bStart) {
				const overlap = Math.min(a.pos + a.length - bStart, b.length);
				return { ...a, length: a.length - overlap };
			}
			return a;
		}
	}
	return a;
}

export function transformOps(opsA: Op[], opsB: Op[]): Op[] {
	let result = opsA.map((x) => ({ ...x } as Op));
	for (const b of opsB) {
		result = result.map((a) => transformOpAgainst(a, b)).filter((op) => {
			if (op.type === "delete" && op.length <= 0) return false;
			return true;
		});
	}
	return result;
}

