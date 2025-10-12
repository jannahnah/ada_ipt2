import React, { useEffect, useState } from "react";
import axios from "axios"; // don't forget this import

export default function Example() {
    const [fname, setFirstname] = useState("");
    const [lname, setLastname] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("");
    const [profiles, setProfiles] = useState([]);
    const [editingId, setEditingId] = useState(null);

    // Reset form
    const resetForm = () => {
        setFirstname("");
        setLastname("");
        setEmail("");
        setPhone("");
        setAddress("");
        setAge("");
        setGender("");
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                // Update
                await axios.put(`/api/profiles/${editingId}`, {
                    fname,
                    lname,
                    email,
                    phone,
                    address,
                    age: age === '' ? null : Number(age),
                    gender,
                });
                alert("Profile updated!");
            } else {
                // Create
                await axios.post("/api/register", {
                    fname,
                    lname,
                    email,
                    phone,
                    address,
                    age: age === '' ? null : Number(age),
                    gender,
                });
                alert("Profile created!");
            }
            resetForm();
            fetchProfiles();
        } catch (error) {
            console.error(error);
            if (error.response && error.response.data && error.response.data.errors) {
                const errors = error.response.data.errors;
                const messages = Object.values(errors).flat().join('\n');
                alert(messages);
            } else if (error.response && error.response.data && error.response.data.message) {
                alert(error.response.data.message);
            } else {
                alert("Error saving profile.");
            }
        }
    };

    const fetchProfiles = async () => {
        try {
            const response = await axios.get("/api/profiles");
            setProfiles(response.data);
        } catch (error) {
            console.error("Error fetching profiles:", error);
        }
    };

    const handleEdit = (profile) => {
        setEditingId(profile.id);
        setFirstname(profile.fname);
        setLastname(profile.lname);
        setEmail(profile.email);
        setPhone(profile.phone);
        setAddress(profile.address);
        setAge(profile.age);
        setGender(profile.gender);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this profile?")) return;
        try {
            await axios.delete(`/api/profiles/${id}`);
            alert("Profile deleted!");
            fetchProfiles();
        } catch (error) {
            console.error(error);
            alert("Error deleting profile.");
        }
    };

    useEffect(() => {
        fetchProfiles();
    }, []);

    return (
        <div className="home">
            <div className="container">
                <form onSubmit={handleSubmit} className="form-container">
                    <div className="form-group">
                        <label>Firstname</label>
                        <input type="text" value={fname} onChange={(e) => setFirstname(e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label>Lastname</label>
                        <input type="text" value={lname} onChange={(e) => setLastname(e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label>Phone</label>
                        <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label>Address</label>
                        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label>Age</label>
                        <input type="number" value={age} onChange={(e) => setAge(e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label>Gender</label>
                        <select value={gender} onChange={(e) => setGender(e.target.value)}>
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>

                    <div className="form-buttons">
                        <button type="submit" className="submit-btn">{editingId ? "Update Profile" : "Create Profile"}</button>
                        {editingId && (
                            <button type="button" className="cancel-btn" onClick={resetForm}>
                                Cancel
                            </button>
                        )}
                    </div>
                </form>

                <table>
                    <thead>
                        <tr>
                            <th>Firstname</th>
                            <th>Lastname</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Address</th>
                            <th>Age</th>
                            <th>Gender</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {profiles.map((profile) => (
                            <tr key={profile.id || profile._id}>
                                <td>{profile.fname}</td>
                                <td>{profile.lname}</td>
                                <td>{profile.email}</td>
                                <td>{profile.phone}</td>
                                <td>{profile.address}</td>
                                <td>{profile.age}</td>
                                <td>{profile.gender}</td>
                                <td>
                                    <button className="edit-btn" onClick={() => handleEdit(profile)}>Edit</button>
                                    <button className="delete-btn" onClick={() => handleDelete(profile.id || profile._id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
