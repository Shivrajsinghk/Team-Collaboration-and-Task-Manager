import { Route } from "react-router-dom"
import PublicProfile from "../pages/PublicProfile";

export const ProfileRoutes = () => (   
    <Route path="profile/:username" element={<PublicProfile />} />  
);
