import { useQueryClient } from '@tanstack/react-query'
import { teamKeys } from '../api/queryKeys'
import { TeamActivityContext } from './TeamActivityContext'

const TeamActivityProviderFunction = ({children}) => {
    const queryClient = useQueryClient()

    const fetchTeamActivities = async (teamID) => {
        if (!teamID) return
        await queryClient.invalidateQueries({
            queryKey: teamKeys.activities(teamID),
        })
    }

    return (
        <TeamActivityContext.Provider
        value={{
            fetchTeamActivities
        }} 
        >
            {children}
        </TeamActivityContext.Provider>
    )
}

export default TeamActivityProviderFunction
