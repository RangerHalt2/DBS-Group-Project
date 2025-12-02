import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../components/styles.css";

export default function UserPage() {
	const { username } = useParams();
	const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
	const [form, setForm] = useState({});
  const [plates, setPlates] = useState();

	useEffect(() => {
		async function fetchUser() {
			const res = await fetch(`http://localhost:3001/api/user/${username}`);
			const data = await res.json();
			setUser(data);
      setForm(data); // store editable copy
		}

    async function fetchPlates() {
			const res = await fetch(`http://localhost:3001/api/user/pickup`, {
        method: "POST",
        body: JSON.stringify({ username: '${username}' }),
      });

			const data = await res.json();
			setPlates(data);
		}

		fetchUser();
    fetchPlates();
	}, [username]);

	if (!user) return <p>Loading...</p>;

	const showCardInfo = user.role === "customer/doner";

  // Handle edit form changes
	function handleChange(e) {
		setForm({ ...form, [e.target.name]: e.target.value });
	}

  function handleCancel() {
    setForm(user);      // reset form to original user data
    setIsEditing(false); // exit editing mode
  }

  // Save updated user info
  async function handleSave(e) {
    e.preventDefault();

    // VALIDATION
    const errorMsg = validateForm();
    if (errorMsg) return alert(errorMsg);

    try {
      const res = await fetch(`http://localhost:3001/api/user/${username}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          password: form.password,
          address: form.address,
          phone_number: form.phone_number,
          cardName: form.cardName,
          cardNumber: form.cardNumber,
        }),
      });
      const data = await res.json();
      alert(data.message);

      setIsEditing(false);
      setUser(form); // update frontend
    } catch (err) {
      console.error(err);
      alert("Error updating user.");
    }
  }

  // Form validation
  function validateForm() {
    if (!form.name || !form.password || !form.address) {
      return "Name, password, and address are required.";
    }

    if (form.password.length < 8) return "Password must be at least 8 characters long.";

    if (form.phone_number && !/^\d{10}$/.test(form.phone_number)) {
      return "Phone number must be exactly 10 digits.";
    }

    if (showCardInfo) {
      if (!form.cardName || !form.cardNumber) return "Card name and number are required.";
      if (!/^\d{15,19}$/.test(form.cardNumber)) return "Card number must be 15-19 digits long.";
    }

    return "";
  }


	// Delete user
	async function handleDelete() {
		if (!window.confirm("Are you sure you want to delete this user?")) return;

		try {
			const res = await fetch(`http://localhost:3001/api/user/${username}`, {
				method: "DELETE",
			});
			const data = await res.json();
			alert(data.message);

			navigate("/"); // redirect after deletion
		} catch (err) {
			console.error(err);
			alert("Error deleting user.");
		}
	}

	return (
		<div className="bg register-container" style={{ padding: "20px" }}>
			<h1
				className="login-title"
				style={{ paddingTop: "10px", fontSize: "2.5rem" }}
			>
				Welcome, {user.name}!
			</h1>

			<form className="profile-form login-card" onSubmit={handleSave}>
				<div className="row">
					<div className="field">
						<label>Name: </label>
						<input type="text" 
              name="name"
              value={form.name}
							onChange={handleChange}
							readOnly={!isEditing}
            />
					</div>

					<div className="field">
						<label>Role: </label>
						<input type="text" name="role" value={user.role} readOnly />
					</div>
				</div>

				<div className="row">
					<div className="field">
						<label>Username: </label>
						<input type="text" name="username" value={user.username} readOnly />
					</div>

					<div className="field">
						<label>Password: </label>
						<input type="text" 
              value={form.password}
              name="password"
							onChange={handleChange}
							readOnly={!isEditing}
            />
					</div>
				</div>

				<div className="row">
					<div className="field">
						<label>Address: </label>
						<input type="text" 
              name="address"
              value={form.address}
							onChange={handleChange}
							readOnly={!isEditing}
            />
					</div>

					<div className="field">
						<label>Phone: </label>
						<input type="text" 
              name="phone_number"
              value={form.phone_number || ""}
							onChange={handleChange}
							readOnly={!isEditing}
            />
					</div>
				</div>

				{/* Shows CC info is customer/doner */}
				{showCardInfo && (
					<div className="row">
						<div className="field">
							<label>Card Name: </label>
							<input type="text" 
                name="cardName"
                value={form.cardName || ""}
								onChange={handleChange}
								readOnly={!isEditing}
              />
						</div>

						<div className="field">
							<label>Card Number: </label>
							<input type="text" 
                name="cardNumber"
                value={form.cardNumber || ""}
								onChange={handleChange}
								readOnly={!isEditing}
              />
						</div>
					</div>
				)}

        <div className="role-buttons">

          <button
            type="button"
            className="login-button"
            style={{ display: isEditing ? "none" : "block" }}
            onClick={() => setIsEditing(true)}
          >
            Edit
          </button>

          <button
            type="submit"
            className="login-button"
            style={{ display: isEditing ? "block" : "none" }}
          >
            Save
          </button>

          <button
            type="submit"
            className="login-button"
            style={{ display: isEditing ? "block" : "none" }}
            onClick={handleCancel}
          >
            Cancel
          </button>

          <button
            type="button"
            className="login-button"
            style={{ backgroundColor: "#04382e", color: "white" }}
            onClick={handleDelete}
          >
            Delete
          </button>

        </div>

			</form>

        <button
          className="login-button"
          onClick={() => navigate(`/restaurant/${username}`)}
        >
          Go to Restaurant Page
        </button>

        <div className="profile-form login-card">
          <table>
            <thead>
              <tr>
                <th>Future Pickup Times</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{plates}</td>
              </tr>
            </tbody>
          </table>
        </div>
		</div>
	);
}
