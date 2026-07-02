import { createContext, useContext } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { taskKeys } from '../api/queryKeys'

export const TaskActivityContext = createContext()

const TaskActivityProviderFunction = ({children}) => {
    const queryClient = useQueryClient()

    const fetchTaskActivities = async (teamID, taskID) => {
        if (!teamID || !taskID) return
        await queryClient.invalidateQueries({
            queryKey: taskKeys.activities(teamID, taskID),
        })
    }

    return (
        <TaskActivityContext.Provider
        value={{
            fetchTaskActivities
        }} 
        >
            {children}
        </TaskActivityContext.Provider>
    )
}

export default TaskActivityProviderFunction

export const useTaskActivityContext = () => useContext(TaskActivityContext)
