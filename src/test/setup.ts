import '@testing-library/jest-dom/vitest';
import {vi} from 'vitest'

if (!Element.prototype.animate) {
	Element.prototype.animate = vi.fn().mockImplementation(() => {
		return {
			finished: Promise.resolve(),
			cancel: vi.fn(),
			finish: vi.fn(),
			pause: vi.fn(),
			play: vi.fn(),
			reverse: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			currentTime: 0,
			playbackRate: 1,
			playState: 'finished',
			replaceState: 'active',
			startTime: 0,
			commitStyles: vi.fn(),
			persist: vi.fn(),
			onfinish: null,
			oncancel: null
		};
	}) as typeof Element.prototype.animate;
}

