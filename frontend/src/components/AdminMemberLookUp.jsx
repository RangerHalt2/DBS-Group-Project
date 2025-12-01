import { useState } from "react";

export default function AdminMemberLookUp() {
	const [name, setUsername] = useState("");

	//Outputs
	const [member, setMember] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const fetchMember = async () => {
		if (!name) {
			setError("Please provide a member name.");
			return;
		}
		setMember(null);
		setError(null);
		setLoading(true);

		try {
			const response = await fetch("http://localhost:3001/api/member_lookup", {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name }),
			});

			const data = await response.json();

			if (response.ok) {
				setMember(data.member);
				console.log(data.report);
			} else {
				setError(data.message || "Failed to fetch report");
			}
		} catch (err) {
			setError("An error occurred while fetching the member");
		}
	};

	return (
		<div>
			<h2 className="text-lg font-semibold">Member Look Up</h2>
			<input
				type="text"
				className="bg-lime-200 text-center rounded-full m-2 outline outline-2 outline-gray-400 outline-offset-3"
				placeholder="Member Name"
				value={name}
				onChange={(e) => setUsername(e.target.value)}
			/>
			<button
				onClick={fetchMember}
				disabled={loading}
				className="bg-gray-500 text-white px-3 py-1 rounded ml-2 disabled:opacity-50 m-2"
			>
				{loading ? "Loading..." : "Generate Report"}
			</button>
		</div>
	);
}
