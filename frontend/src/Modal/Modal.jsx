import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { isPending } from '@reduxjs/toolkit'

function Modal({ isOpen, onClose, children }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'auto'
        }
        return () => {
            document.body.style.overflow = 'auto'
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div
            className="
            fixed inset-0 z-50
            flex items-center justify-center
            bg-black/60
            backdrop-blur-sm
            px-4 
            "
        >
            <div
                className="
                relative
                w-full max-w-md
                rounded-[2rem]
                border border-white/10
                bg-[#0b0b0c]
                p-6
                shadow-2xl
                "
            >
                <button
                    onClick={() => onClose(false)}
                    className="
                    absolute right-5 top-5
                    text-gray-400
                    transition
                    hover:text-white
                    "
                >
                    <X size={22} />
                </button>
                {children}
            </div>
        </div>
    )
}

export default Modal