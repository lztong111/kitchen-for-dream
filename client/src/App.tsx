import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import DishDetail from "./pages/DishDetail";
import DishEditor from "./pages/DishEditor";
import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="dish/:id" element={<DishDetail />} />
        <Route path="dish/new" element={<DishEditor />} />
        <Route path="dish/:id/edit" element={<DishEditor />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>
    </Routes>
  );
}
