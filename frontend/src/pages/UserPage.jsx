import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
//import { useNavigate } from "react-router-dom";
import "../components/styles.css";

export default function UserPage() {
  const { username } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch(`http://localhost:3001/api/user/${username}`);
      const data = await res.json();
      setUser(data);
    }
    fetchUser();
  }, [username]);

  if (!user) return <p>Loading...</p>;

  const showCardInfo = user.role === "customer/doner";

  return (
    <div className="bg register-container" style={{ padding: "20px" }}>
      <h1 className="login-title" style={{ paddingTop: "10px", fontSize: "2.5rem" }}>
        Welcome, {user.name}!
      </h1>

      <form className="profile-form login-card">

        <div className="row">
          <div className="field">
            <label>Name  </label>
            <input type="text" value={user.name} readOnly />
          </div>

          <div className="field">
            <label>Role </label>
            <input type="text" value={user.role} readOnly />
          </div>
        </div>

        <div className="row">
          <div className="field">
            <label>Username  </label>
            <input type="text" value={user.username} readOnly />
          </div>

          <div className="field">
            <label>Password  </label>
            <input type="text" value={user.password} readOnly />
          </div>
        </div>

        <div className="row">
          <div className="field">
            <label>Address  </label>
            <input type="text" value={user.address} readOnly />
          </div>

          <div className="field">
            <label>Phone  </label>
            <input type="text" value={user.phone_number || "N/A"} readOnly />
          </div>
        </div>

        {/* Shows CC info is customer/doner */}
        {showCardInfo && (
          <div className="row">
            <div className="field">
              <label>Card Name  </label>
              <input type="text" value={user.cardName} readOnly />
            </div>

            <div className="field">
              <label>Card Number  </label>
              <input type="text" value={user.cardNumber} readOnly />
            </div>
          </div>
        )}

        <div className="role-buttons">
          <button className="login-button">Edit</button>
          <button className="login-button" style={{ backgroundColor: '#04382e', color: "white" }}>Delete</button>
        </div>
        
      </form>

      {/* Button is for each user to go to respective page
      - customer/donner: go to buy food
      - needy: see what food is available
      - restaurants: keep track of inventory
      */}
      <button 
        className="floating-button"
        onClick={() => console.log("Go to member's according page")}
      >
       Let's go!
      </button> 

    </div>
  );
}
