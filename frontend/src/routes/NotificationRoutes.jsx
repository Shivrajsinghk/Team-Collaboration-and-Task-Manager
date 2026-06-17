import { Route } from "react-router-dom"
import Notifications from "../pages/Notifications";

export const NotificationRoutes = () => (
    <>    
        <Route path="/notifications" element={<Notifications />} />
    </>
);
