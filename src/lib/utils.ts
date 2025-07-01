import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { cubicOut } from "svelte/easing";
import type { TransitionConfig } from "svelte/transition";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Type voor Shadcn components met element refs
export type WithElementRef<T extends Record<string, any>, K extends keyof T = never> = T & {
	element?: HTMLElement;
} & {
	[P in K]: T[P];
};

type FlyAndScaleParams = {
	y?: number;
	x?: number;
	start?: number;
	duration?: number;
};

export const flyAndScale = (
	node: Element,
	params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
	const style = getComputedStyle(node);
	const transform = style.transform === "none" ? "" : style.transform;

	const scaleConversion = (
		valueA: number,
		scaleA: [number, number],
		scaleB: [number, number]
	) => {
		const [minA, maxA] = scaleA;
		const [minB, maxB] = scaleB;

		const percentage = (valueA - minA) / (maxA - minA);
		const valueB = percentage * (maxB - minB) + minB;

		return valueB;
	};

	const styleToString = (
		style: Record<string, number | string | undefined>
	): string => {
		return Object.keys(style).reduce((str, key) => {
			if (style[key] === undefined) return str;
			return str + `${key}:${style[key]};`;
		}, "");
	};

	return {
		duration: params.duration ?? 200,
		delay: 0,
		css: (t) => {
			const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
			const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
			const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

			return styleToString({
				transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
				opacity: t
			});
		},
		easing: cubicOut
	};
};

/**
 * Normalize URL by adding https:// prefix if missing
 * Used across all scan modules for consistent URL handling
 */
export function normalizeUrl(url: string): string {
	if (!url) return url;
	
	// Return as-is if already has protocol
	if (url.startsWith('http://') || url.startsWith('https://')) {
		return url;
	}
	
	// Add https:// prefix for relative URLs
	const normalized = 'https://' + url;
	console.log(`URL normalized: ${url} -> ${normalized}`);
	return normalized;
}

/**
 * Validate URL format and normalize if needed
 * Returns normalized URL or throws error for invalid URLs
 */
export function validateAndNormalizeUrl(url: string): string {
	const normalized = normalizeUrl(url);
	
	try {
		new URL(normalized);
		return normalized;
	} catch (error) {
		throw new Error(`Invalid URL format: ${url}`);
	}
}