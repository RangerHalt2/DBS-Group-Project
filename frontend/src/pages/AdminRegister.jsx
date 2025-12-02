import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../components/styles.css";

export default function AdminRegister() {
	const navigate = useNavigate();

	const [ssn, setSsn] = useState("");
	const [name, setName] = useState("");
	const [salary, setSalary] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchAdmin = async () => {
			try {
				const res = await fetch("http://localhost:3001/api/admin/me", {
					method: "POST",
					credentials: "include", // important to send cookies
				});

				if (res.status === 401) {
					// Not authorized → redirect to index
					window.location.href = "/";
					return;
				}

				const data = await res.json();
			} catch (err) {
				console.error("Error fetching admin info:", err);
				window.location.href = "/";
			}
		};

		fetchAdmin();
	}, []);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!ssn || !name || !salary || !username || !password) {
			setError("All fields are required.");
			return;
		} else {
			try {
				const response = await fetch(
					"http://localhost:3001/api/admin_register",
					{
						method: "POST",
						credentials: "include",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ ssn, name, salary, username, password }),
					}
				);
				const data = await response.json();

				if (!response.ok) {
					setError(data.message);
					return;
				}
				console.log("Registration successful:", data.user);
				setError(null);
				navigate(`/adminLogin`); //redirect to admin login page
			} catch (err) {
				setError("Registration failed. Please try again.");
				console.error(err);
			}
		}
	};

	return (
		<div className="bg">
			<form onSubmit={handleSubmit} className="login-card">
				<h1 className="login-title">Admin Registration</h1>
				{error && <p className="text-red-600">{error}</p>}

				<input
					type="text"
					placeholder="SSN"
					className="login-input"
					value={ssn}
					onChange={(e) => {
						setSsn(e.target.value);
						setError(null);
					}}
				/>

				<input
					type="text"
					placeholder="Name"
					className="login-input"
					value={name}
					onChange={(e) => {
						setName(e.target.value);
						setError(null);
					}}
				/>

				<input
					type="number"
					placeholder="Salary"
					className="login-input"
					value={salary}
					onChange={(e) => {
						setSalary(e.target.value);
						setError(null);
					}}
				/>

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
					onChange={(e) => {
						setPassword(e.target.value);
						setError(null);
					}}
				/>

				<button type="submit" className="login-button">
					Register Admin
				</button>
			</form>
		</div>
	);
}
