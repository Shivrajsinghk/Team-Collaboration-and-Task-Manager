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
                `z-20 left-6  hover:border-cyan-400/20 top-6 rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10
                ${className}`
            }
        >
            <ArrowLeft size={14} />
        </button>
    )
}

export default PreviousPageButton