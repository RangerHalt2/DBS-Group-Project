import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/home";
import { NotFound } from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserPage from "./pages/UserPage";
import Restaurant from "./pages/Restaurant";
import AdminLogin from "./pages/AdminLogin";
import AdminRegister from "./pages/AdminRegister";
import { AdminHub } from "./pages/AdminHub";
import Plates from "./pages/Plates";
import Navbar from "./Navbar";
import { AuthContext, AuthProvider } from "./components/AuthContext";

function App() {
	return (
		<BrowserRouter>
			<AuthProvider>
				<Navbar />
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/login" element={<Login />} />
					<Route path="/adminLogin" element={<AdminLogin />} />
					<Route path="/AdminRegister" element={<AdminRegister />} />
					<Route path="/AdminHub" element={<AdminHub />} />
					<Route path="/register" element={<Register />} />
					<Route path="/user/:username" element={<UserPage />} />
					<Route path="/restaurant/:username" element={<Restaurant />} />
					<Route path="/plates" element={<Plates />} />
					<Route path="*" element={<NotFound />} />
				</Routes>
			</AuthProvider>
		</BrowserRouter>
	);
}

export default App;
