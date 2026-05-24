/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from 'react'
import api from '../api/axios'

export const TeamActivityContext = createContext()

const TeamActivityProviderFunction = ({children}) => {
    const [activities, setActivities] = useState([])
    const fetchTeamActivities = async (teamID) => {
        try{
            const response = await api.get(`activity/teams/${teamID}/activities/`)
            setActivities(response.data)
        }
        catch(error){
            console.log(error)
        }
    }

    return (
        <TeamActivityContext.Provider
        value={{
            activities, 
            fetchTeamActivities
        }} 
        >
            {children}
        </TeamActivityContext.Provider>
    )
}

export default TeamActivityProviderFunction
