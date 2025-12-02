import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../components/styles.css";

export default function Register() {
	const navigate = useNavigate();

	const [role, setRole] = useState("");
	const [form, setForm] = useState({
		name: "",
		username: "",
		password: "",
		address: "",
		phone: "",
		cardName: "",
		cardNumber: "",
	});

	const [error, setError] = useState(null);

	const handleRole = (selectedRole) => {
		setRole(selectedRole);
		setError("");
	};

	const handleChange = (e) => {
		setForm({ ...form, [e.target.placeholder]: e.target.value });
	};

	//validation
	const validateForm = () => {
		if (!role) return "Please select a role.";

		// Required for ALL:
		if (!form.name || !form.username || !form.password || !form.address) {
			return "Please fill in all required fields.";
		}

		// Phone required EXCEPT needy
		if (role !== "Needy" && !form.phone) {
			return "Phone number is required for this role.";
		}

		// Credit card required only for Customer + Doner
		if (
			(role === "Customer" || role === "Doner") &&
			(!form.cardName || !form.cardNumber)
		) {
			return "Credit card information is required for this role.";
		}

		return "";
	};

	// submit
	const handleSubmit = async (e) => {
		e.preventDefault();
		const msg = validateForm();
		if (msg) return setError(msg);

		const res = await fetch("http://localhost:3001/api/register", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ role: role.toLowerCase(), ...form }),
		});

		const data = await res.json();

		if (!res.ok) return setError(data.error);

		//change navigation according to page of type of member
		navigate("/user/"+form.username);
	};

	return (
		<div className="bg register-container">
			<section>
				<h1 className="login-title">Who are you?</h1>

				<div className="role-buttons">
					{["Customer", "Needy", "Doner", "Restaurant"].map((r) => (
						<button
							key={r}
							type="button"
							className={`login-button ${role === r ? "active-role" : ""}`}
							onClick={() => handleRole(r)}
						>
							{r}
						</button>
					))}
				</div>
			</section>

			{/* Hide form until role selected */}
			{role && (
				<form
					className="login-card"
					style={{ padding: "2.5rem 3rem", width: "80%", maxWidth: "950px" }}
					onSubmit={handleSubmit}
				>
					<h2
						className="login-title"
						style={{ paddingBottom: "10px", fontSize: "1.5rem" }}
					>
						Register as {role}
					</h2>

					{error && <p className="error-text">{error}</p>}

					<div className="row">
						<input
							type="text"
							placeholder="name"
							className="login-input"
							onChange={handleChange}
						/>
						<input
							type="text"
							placeholder="username"
							className="login-input"
							onChange={handleChange}
						/>
						<input
							type="password"
							placeholder="password"
							className="login-input"
							onChange={handleChange}
						/>
					</div>

					<div className="row">
						<input
							type="text"
							placeholder="address"
							className="login-input"
							onChange={handleChange}
						/>
						<input
							type="text"
							placeholder="phone"
							className="login-input"
							onChange={handleChange}
						/>
					</div>

					{/* CREDIT CARD ROW — only for Customer + Doner */}
					{(role === "Customer" || role === "Doner") && (
						<div className="row">
							<input
								type="text"
								placeholder="cardName"
								className="login-input"
								onChange={handleChange}
							/>
							<input
								type="text"
								placeholder="cardNumber"
								className="login-input"
								onChange={handleChange}
							/>
						</div>
					)}

					<button type="submit" className="login-button submit-btn">
						Sign Up
					</button>
				</form>
			)}
		</div>
	);
}
