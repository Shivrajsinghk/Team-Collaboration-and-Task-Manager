import { Route } from "react-router-dom"
import MessageDashboard from "../pages/MessageDashboard";

export const ChatRoutes = () => (
    <>    
        <Route path="/messages" element={<MessageDashboard />} />
        <Route path="/messages/:conversation_id" element={<MessageDashboard />} />
    </>
);
