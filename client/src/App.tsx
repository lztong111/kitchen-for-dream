import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import DishDetail from "./pages/DishDetail";
import DishEditor from "./pages/DishEditor";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserProfile from "./pages/UserProfile";
import Settings from "./pages/Settings";
import TodayMenu from "./pages/TodayMenu";
import Pantry from "./pages/Pantry";
import Favorites from "./pages/Favorites";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="dish/:id" element={<DishDetail />} />
        <Route path="dish/new" element={<DishEditor />} />
        <Route path="dish/:id/edit" element={<DishEditor />} />
        <Route path="user/:id" element={<UserProfile />} />
        <Route path="favorites" element={<Favorites />} />
        <Route path="settings" element={<Settings />} />
        <Route path="menu/today" element={<TodayMenu />} />
        <Route path="pantry" element={<Pantry />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
