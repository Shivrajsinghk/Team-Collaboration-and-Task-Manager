import { useQuery } from '@tanstack/react-query'
import { getUserProfile } from '../api/auth'
import { authKeys } from '../api/queryKeys'

export function useCurrentUserQuery(options = {}) {
    return useQuery({
        queryKey: authKeys.me,
        queryFn: async () => {
            const response = await getUserProfile()
            return response.data
        },
        staleTime: 15 * 1000,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        ...options,
    })
}
