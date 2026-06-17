import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './Features/store.js'
import TeamActivityProviderFunction from './context/TeamActivityContext.jsx'
import TaskActivityProviderFunction from './context/TaskActivityContext.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'

createRoot(document.getElementById('root')).render(
    <Provider store={store}>
        <BrowserRouter>
            <NotificationProvider>
                <TeamActivityProviderFunction>
                    <TaskActivityProviderFunction>
                        <App />
                    </TaskActivityProviderFunction>
                </TeamActivityProviderFunction>
            </NotificationProvider>
        </BrowserRouter>
    </Provider>
)
