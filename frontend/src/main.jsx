import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './Features/store.js'
import TeamActivityProviderFunction from './context/TeamActivityContext.jsx'
import TaskActivityProviderFunction from './context/TaskActivityContext.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'
import { ChatProvider } from './context/ChatContext.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000,
            // Garbage Collection Time
            gcTime: 10 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
        },
        mutations: {
            retry: 0,
        },
    },
})

createRoot(document.getElementById('root')).render(
    <Provider store={store}>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <NotificationProvider>
                    <ChatProvider>
                        <TeamActivityProviderFunction>
                            <TaskActivityProviderFunction>
                                <App />
                                <ReactQueryDevtools initialIsOpen={false} />
                            </TaskActivityProviderFunction>
                        </TeamActivityProviderFunction>
                    </ChatProvider>
                </NotificationProvider>
            </BrowserRouter>
        </QueryClientProvider>
    </Provider>
)
