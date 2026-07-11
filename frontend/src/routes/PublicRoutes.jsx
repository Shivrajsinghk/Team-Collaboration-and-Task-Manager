// routes/PublicRoutes.jsx
import { Route } from "react-router-dom"
import Home from "../pages/Home"
import Login from "../pages/Login"
import Signup from "../pages/Signup"
import PublicOnlyRoute from "../components/PublicOnlyRoute"

export const PublicRoutes = () => (
    <>
        <Route path="/" element={<Home />} />

        <Route element={<PublicOnlyRoute />}>
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
        </Route>
    </>
)