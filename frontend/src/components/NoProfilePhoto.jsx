import React from 'react'

function NoProfilePhoto({ size = 48, className = "" }) {
    return (
        <div
            style={{ width: size, height: size }}
            className={`relative flex-shrink-0 overflow-hidden rounded-full bg-surface-alt ${className}`}
        >
            <svg
                viewBox="0 0 100 100"
                className="absolute inset-0 h-full w-full"
                aria-hidden="true"
            >
                <circle cx="50" cy="36" r="18" className="fill-border" />
                <circle cx="50" cy="105" r="42" className="fill-border" />
            </svg>
        </div>
    )
}

export default NoProfilePhoto