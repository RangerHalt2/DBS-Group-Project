import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../components/styles.css";

export default function RestaurantPage() {
  const { username } = useParams();
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [newItem, setNewItem] = useState({
    description: "",
    price: "",
    quantity: "",
    start_time: "",
    end_time: ""
  });

  useEffect(() => {
    fetchItems();
  }, [username]);

  const fetchItems = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/restaurant/items?username=${username}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to load items");
        return;
      }
      setItems(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load inventory.");
    }
  };

  const handleDelete = async (pid) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const res = await fetch(`http://localhost:3001/api/restaurant/items/${pid}?username=${username}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to delete item");
        return;
      }
      setItems(items.filter(item => item.pid !== pid));
      setSelectedItem(null);
      setEditing(false);
    } catch (err) {
      console.error(err);
      setError("Failed to delete item.");
    }
  };

  const handleSave = async () => {
  try {
    const res = await fetch(`http://localhost:3001/api/restaurant/items?username=${username}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pid: selectedItem.pid,
        description: selectedItem.description,
        price: parseFloat(selectedItem.price),
        quantity: parseInt(selectedItem.quantity_available),
        start_time: selectedItem.start_time,
        end_time: selectedItem.end_time
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.message || "Failed to update item");
      return;
    }

    fetchItems();
    setEditing(false);
    setSelectedItem(null);
  } catch (err) {
    console.error(err);
    setError("Failed to update item.");
  }
};


  const handleAdd = async () => {
  try {
    const res = await fetch(`http://localhost:3001/api/restaurant/items?username=${username}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: newItem.description,
        price: parseFloat(newItem.price),
        quantity: parseInt(newItem.quantity),
        start_time: newItem.start_time,
        end_time: newItem.end_time
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.message || "Failed to add item");
      return;
    }

    fetchItems();
    setNewItem({ description: "", price: "", quantity: "", start_time: "", end_time: "" });
    setShowAddPopup(false);
  } catch (err) {
    console.error(err);
    setError("Failed to add item.");
  }
};


  return (
    <div className="bg register-container">
      <h1 className="login-title">Restaurant Inventory</h1>

      {error && <p className="error-text">{error}</p>}

      <div className="inventory-grid">
        {items.length === 0 && !error && <p>No items found.</p>}

        {items.map((item) => (
          <div
            key={item.pid}
            className="inventory-card"
            onClick={() => { setSelectedItem(item); setEditing(false); }}
          >
            <h3>{item.description}</h3>
            <p>Price: ${item.price}</p>
            <p>Available: {item.quantity_available}</p>
          </div>
        ))}
      </div>

      <button
        className="login-button"
        onClick={() => setShowAddPopup(true)}
      >
        Add New Item
      </button>

      {selectedItem && (
        <div className="popup-overlay" onClick={() => { setSelectedItem(null); setEditing(false); }}>
          <div className="popup-card" onClick={(e) => e.stopPropagation()}>
            {!editing ? (
              <>
                <h2>{selectedItem.description}</h2>
                <p>Price: ${selectedItem.price}</p>
                <p>Available: {selectedItem.quantity_available}</p>
                <p>Total Sold: {selectedItem.total_sold}</p>
                <p>
                  Window:{" "}
                  {new Date(selectedItem.start_time).toLocaleString()} –{" "}
                  {new Date(selectedItem.end_time).toLocaleString()}
                </p>
                <button className="login-button" onClick={() => setEditing(true)}>
                  Update
                </button>
                <button className="login-button" onClick={() => handleDelete(selectedItem.pid)}>
                  Delete
                </button>
                <button className="login-button" onClick={() => setSelectedItem(null)}>
                  Close
                </button>
              </>
            ) : (
              <>
                <h2>Edit Item</h2>
                <input
                  type="text"
                  value={selectedItem.description}
                  onChange={(e) => setSelectedItem({ ...selectedItem, description: e.target.value })}
                />
                <input
                  type="number"
                  value={selectedItem.price}
                  onChange={(e) => setSelectedItem({ ...selectedItem, price: e.target.value })}
                />
                <input
                  type="number"
                  value={selectedItem.quantity_available}
                  onChange={(e) => setSelectedItem({ ...selectedItem, quantity_available: e.target.value })}
                />
                <input
                  type="datetime-local"
                  value={new Date(selectedItem.start_time).toISOString().slice(0,16)}
                  onChange={(e) => setSelectedItem({ ...selectedItem, start_time: e.target.value })}
                />
                <input
                  type="datetime-local"
                  value={new Date(selectedItem.end_time).toISOString().slice(0,16)}
                  onChange={(e) => setSelectedItem({ ...selectedItem, end_time: e.target.value })}
                />
                <button className="login-button" onClick={handleSave}>
                  Save
                </button>
                <button className="login-button" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Add Item Popup */}
      {showAddPopup && (
        <div className="popup-overlay" onClick={() => setShowAddPopup(false)}>
          <div className="popup-card" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Item</h2>
            <input
              type="text"
              placeholder="Description"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            />
            <input
              type="number"
              placeholder="Price"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
            />
            <input
              type="number"
              placeholder="Quantity"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
            />
            <input
              type="datetime-local"
              placeholder="Start Time"
              value={newItem.start_time}
              onChange={(e) => setNewItem({ ...newItem, start_time: e.target.value })}
            />
            <input
              type="datetime-local"
              placeholder="End Time"
              value={newItem.end_time}
              onChange={(e) => setNewItem({ ...newItem, end_time: e.target.value })}
            />
            <button className="login-button" onClick={handleAdd}>
              Add Item
            </button>
            <button className="login-button" onClick={() => setShowAddPopup(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
