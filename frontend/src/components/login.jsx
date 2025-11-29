import { useState } from "react";
//comment for github
export default function LoginForm() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState(null);

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
				});
				const data = await response.json();

				if (!response.ok) {
					setError(data.message);
					return;
				}
				console.log("Login successful:", data.user);
				setError(null);
			} catch (err) {
				setError("Login failed. Please try again.");
				console.error(err);
			}
		}
	};

	return (
		<section className="">
			<h1 className="text-center">Welcome to Waste Not Kitchen</h1>

			<form
				onSubmit={handleSubmit}
				className="flex flex-col gap-4 w-80 p-4 border rounded-xl shadow"
			>
				<h2 className="text-xl font-semibold">Login</h2>

				{error && <div className="text-red-600">{error}</div>}

				<input
					type="text"
					placeholder="Username"
					value={username}
					onChange={(e) => {
						setUsername(e.target.value);
						setError(null);
					}}
					className="p-2 border rounded-xl"
				/>

				<input
					type="password"
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					className="p-2 border rounded-xl"
				/>

				<button
					type="submit"
					className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700"
				>
					Login
				</button>
			</form>
		</section>
	);
}
