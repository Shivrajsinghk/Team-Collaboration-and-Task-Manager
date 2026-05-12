import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../Features/authslice'

export const store = configureStore({
    reducer: {
        auth: authReducer
    }
})