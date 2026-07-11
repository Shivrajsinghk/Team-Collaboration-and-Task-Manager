import React from 'react'
import {ArrowLeft} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function PreviousPageButton({className=""}) {
    const navigate = useNavigate()
    
    const handleBack = () => {
        if(window.history.length > 1){
            navigate(-1)
        }
        else{
            navigate('/dashboard')
        }
    }

    return (
        <button
            onClick={handleBack}
            className={
                `z-20 left-8 top-8 rounded-xl border border-border bg-surface-alt p-3 text-ink transition-colors hover:border-accent hover:bg-surface
                ${className}`
            }
        >
            <ArrowLeft size={14} />
        </button>
    )
}

export default PreviousPageButton