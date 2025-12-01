import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/home";
import { NotFound } from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserPage from "./pages/UserPage";
import Restaurant from "./pages/Restaurant";
import Navbar from "./Navbar";

function App() {
	return (
		<BrowserRouter>
			<Navbar />
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />
				<Route path="/user/:username" element={<UserPage />} />
				<Route path="/restaurant/:username" element={<Restaurant />} />
				<Route path="*" element={<NotFound />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
