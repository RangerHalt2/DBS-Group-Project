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
				console.log(data.member);
			} else {
				setError(data.message || "Failed to fetch report");
			}
		} catch (err) {
			setError("An error occurred while fetching the member");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="no_style">
			<h2 className="text-lg font-semibold">Member Look Up</h2>
			<input
				type="text"
				className="bg-lime-200 text-center rounded-full m-2 outline outline-2 outline-gray-400 outline-offset-3"
				placeholder="Member Name"
				value={name}
				onChange={(e) => {
					setUsername(e.target.value);
					setError(null);
				}}
			/>
			<button
				onClick={fetchMember}
				disabled={loading}
				className="bg-gray-500 text-white px-3 py-1 rounded ml-2 disabled:opacity-50 m-2 "
			>
				{loading ? "Loading..." : "Look Up Member"}
			</button>
			{error && <p style={{ color: "red" }}>{error}</p>}

			{member && (
				<div className="text-center bg-lime-50">
					<p>Username: {member.username}</p>
					<p>Password: {member.password}</p>
					<p>Name: {member.name}</p>
					<p>Address: {member.address}</p>
					<p>Phone: {member.phone_number}</p>
					{member.buyer_info && (
						<div>
							<p>Card Number: {member.buyer_info.card_number}</p>
							<p>Card Name: {member.buyer_info.cardholder_name}</p>
						</div>
					)}
					{member.reservations && member.reservations.length > 0 && (
						<div>
							<h3 className="text-lg font-semibold">Reservations</h3>
							{member.reservations.map((res) => (
								<div key={res.reserve_id} className="reservation-line">
									<p>Plate ID: {res.plate_id}</p>
									<p>
										Pickup Time: {new Date(res.pick_up_time).toLocaleString()}
									</p>
									<p>Quantity: {res.quantity}</p>
								</div>
							))}
						</div>
					)}
				</div>
			)}
			{member && (
				<button
					onClick={() => setMember(null)}
					disabled={member === null}
					className="bg-gray-500 text-white px-3 py-1 rounded ml-2 disabled:opacity-0"
				>
					Clear Report
				</button>
			)}
		</div>
	);
}
