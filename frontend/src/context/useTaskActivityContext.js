import { useContext } from 'react'
import { TaskActivityContext } from './TaskActivityContext'

export const useTaskActivityContext = () => useContext(TaskActivityContext)
