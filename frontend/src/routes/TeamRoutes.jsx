import { Route } from "react-router-dom";
import MemberProfile from "../pages/MemberProfile";
import Members from "../pages/Members";
import Team from "../pages/Team";
import TeamDashboard from "../pages/TeamDashboard";
import Teams from "../pages/Teams";
import TeamSettings from "../pages/TeamSettings";
import { TaskRoutes } from "./TaskRoutes";
import TeamChats from '../pages/TeamChats'

export const TeamRoutes = () => (
    <>
        <Route path="/teams" element={<Teams />} />
        <Route path="/team/:team_id" element={<Team />}>
            <Route index element={<TeamDashboard />} />
            <Route path="members" element={<Members />} />
            <Route path="members/:member_id" element={<MemberProfile />} />
            <Route path="settings" element={<TeamSettings />} />
            <Route path="chats" element={<TeamChats />} />
            {TaskRoutes()}
        </Route>
    </>
);
