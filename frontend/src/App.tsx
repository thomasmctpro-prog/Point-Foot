import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Results from "./pages/Results";
import LeagueFriends from "./pages/LeagueFriends";
import News from "./pages/News";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Results />} />
        <Route path="ligue" element={<LeagueFriends />} />
        <Route path="actus" element={<News />} />
      </Route>
    </Routes>
  );
}
