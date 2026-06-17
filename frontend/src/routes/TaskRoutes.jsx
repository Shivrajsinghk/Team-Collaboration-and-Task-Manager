import { Route } from "react-router-dom";
import TaskDashboard from "../pages/TaskDashboard";
import TeamTasks from "../pages/TeamTasks";

export const TaskRoutes = () => (
    <>
        <Route path="tasks" element={<TeamTasks />} />
        <Route path="tasks/:task_id" element={<TaskDashboard />} />
    </>
);
