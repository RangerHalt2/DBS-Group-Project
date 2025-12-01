import { useState } from "react";

export default function AdminMemberLookUp() {
	const [name, setUsername] = useState("");

	//Outputs
	const [report, setReport] = useState(null);

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
			<button className="bg-gray-500 text-white px-3 py-1 rounded ml-2">
				Search
			</button>
		</div>
	);
}
