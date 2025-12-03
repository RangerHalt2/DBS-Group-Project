import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "../components/styles.css";
import { AuthContext } from "../components/AuthContext.jsx";
//imports

export default function Login() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState(null);
	const navigate = useNavigate(); //go to register page or after logging-in

	const { setUserRole } = useContext(AuthContext);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!username || !password) {
			setError("Both fields are required.");
		} else {
			try {
				const response = await fetch("http://localhost:3001/api/login", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ username, password }),
					credentials: "include",
				});
				const data = await response.json();

				if (!response.ok) {
					setError(data.message);
					return;
				}

				console.log("Login successful:", data.user);
				setError(null);
				setUserRole(data.user_type);
				navigate(`/user/${data.user.username}`); //redirect to userpage
			} catch (err) {
				setError("Login failed. Please try again.");
				console.error(err);
			}
		}
	};

	return (
		<div className="bg">
			<form onSubmit={handleSubmit} className="login-card">
				<h1 className="login-title">Welcome to WNK!</h1>

				{error && <p className="text-red-600">{error}</p>}

				<input
					type="text"
					placeholder="Username"
					className="login-input"
					value={username}
					onChange={(e) => {
						setUsername(e.target.value);
						setError(null);
					}}
				/>

				<input
					type="password"
					placeholder="Password"
					className="login-input"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>

				<button type="submit" className="login-button">
					Login
				</button>

				<button
					type="button"
					className="sign-up-button"
					onClick={() => navigate("/register")}
				>
					Click here to sign up!
				</button>
			</form>
		</div>
	);
}
