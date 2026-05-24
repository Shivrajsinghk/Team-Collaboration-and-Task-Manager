/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from 'react'
import api from '../api/axios'

export const TaskActivityContext = createContext()

const TaskActivityProviderFunction = ({children}) => {
    const [activities, setActivities] = useState([])
    const fetchTaskActivities = async (teamID, taskID) => {
        try{
            const response = await api.get(`activity/teams/${teamID}/tasks/${taskID}/activities/`)
            setActivities(response.data)
        }
        catch(error){
            console.log(error)
        }
    }

    return (
        <TaskActivityContext.Provider
        value={{
            activities, 
            fetchTaskActivities
        }} 
        >
            {children}
        </TaskActivityContext.Provider>
    )
}

export default TaskActivityProviderFunction
