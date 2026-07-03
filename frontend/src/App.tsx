import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./lib/AuthContext";
import Layout from "./components/Layout";
import Results from "./pages/Results";
import LeagueFriends from "./pages/LeagueFriends";
import News from "./pages/News";
import Login from "./pages/Login";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Results />} />
          <Route path="ligue" element={<LeagueFriends />} />
          <Route path="actus" element={<News />} />
          <Route path="connexion" element={<Login />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
