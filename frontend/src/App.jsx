import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/home";
import { NotFound } from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserPage from "./pages/UserPage";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route index element={<Home />} />
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />
				<Route path="/userpage" element={<UserPage />} />
				<Route path="*" element={<NotFound />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
