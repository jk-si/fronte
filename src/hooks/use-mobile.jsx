import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
	// Compute initial value on first render (no flash of wrong layout)
	const getIsMobile = React.useCallback(() => {
		if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') {
			return false
		}
		return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches
	}, [])

	const [isMobile, setIsMobile] = React.useState(getIsMobile)

	React.useEffect(() => {
		if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') {
			setIsMobile(false)
			return
		}

		const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
		const onChange = (e) => {
			setIsMobile(e.matches)
		}

		// Set once on mount to be safe
		setIsMobile(mql.matches)

		// Cross-browser listener: addEventListener in modern, addListener fallback
		if (typeof mql.addEventListener === 'function') {
			mql.addEventListener('change', onChange)
			return () => mql.removeEventListener('change', onChange)
		} else if (typeof mql.addListener === 'function') {
			mql.addListener(onChange)
			return () => mql.removeListener(onChange)
		}
	}, [getIsMobile])

	return !!isMobile
} 