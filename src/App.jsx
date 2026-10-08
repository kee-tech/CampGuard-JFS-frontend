import { useEffect, useState } from "react";
import { BrowserRouter, useNavigate } from "react-router-dom";
import axios from "axios";
import "./App.css";
import Login from "./Login";

const API = "http://localhost:8080/api";
axios.interceptors.request.use((config) => {
    const savedUser = localStorage.getItem("campguardUser");

    if (savedUser) {
        const user = JSON.parse(savedUser);

        if (user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
    }

    return config;
});

function App() {

    /* ================= LOGIN ================= */

    const [loggedInUser, setLoggedInUser] = useState(() => {
        const savedUser = localStorage.getItem("campguardUser");

        if (savedUser) {
            try {
                return JSON.parse(savedUser);
            } catch {
                return null;
            }
        }

        return null;
    });

    const navigate = useNavigate();

    const getPageFromURL = () => {
        const path = window.location.pathname;
        if (path === "/personnel") return "Personnel";
        if (path === "/equipment") return "Equipment";
        if (path === "/duties") return "Duties";
        if (path === "/reports") return "Reports";
        return "Dashboard";
    };

    const [page, setPage] = useState(getPageFromURL);

    /* ================= DATA ================= */

    const [personnel, setPersonnel] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [duties, setDuties] = useState([]);

    const [search, setSearch] = useState("");

    /* ================= FORMS ================= */

    const [personnelForm, setPersonnelForm] = useState({
        serviceNumber: "",
        name: "",
        rank: "",
        unit: "",
        contactNumber: "",
        email: ""
    });

    const [equipmentForm, setEquipmentForm] = useState({
        equipmentName: "",
        equipmentCode: "",
        category: "",
        quantity: "",
        status: "Available"
    });

    const [dutyForm, setDutyForm] = useState({
        dutyName: "",
        assignedTo: "",
        dutyDate: "",
        shift: "",
        location: "",
        status: "Assigned"
    });

    /* ================= EDITING ================= */

    const [editingPersonnel, setEditingPersonnel] = useState(null);
    const [editingEquipment, setEditingEquipment] = useState(null);
    const [editingDuty, setEditingDuty] = useState(null);

    /* ================= FORM VISIBILITY ================= */

    const [showPersonnelForm, setShowPersonnelForm] = useState(false);
    const [showEquipmentForm, setShowEquipmentForm] = useState(false);
    const [showDutyForm, setShowDutyForm] = useState(false);

    const [loading, setLoading] = useState(false);

    /* ================= ROLE ================= */

    const isAdmin = loggedInUser?.role === "ADMINISTRATOR";

    /* ================= LOGIN ================= */

    const handleLogin = (user) => {
        setLoggedInUser(user);
        localStorage.setItem("campguardUser", JSON.stringify(user));
        setPage("Dashboard");
        navigate("/dashboard");
    };

    const handleLogout = () => {
        localStorage.removeItem("campguardUser");

        setLoggedInUser(null);
        setPage("Dashboard");
        navigate("/");

        setPersonnel([]);
        setEquipment([]);
        setDuties([]);

        resetPersonnelForm();
        resetEquipmentForm();
        resetDutyForm();
    };

    /* ================= LOAD DATA ================= */

    useEffect(() => {
        if (loggedInUser) {
            loadAllData();
        }
    }, [loggedInUser]);

    const loadAllData = async () => {

        try {

            setLoading(true);

            const [p, e, d] = await Promise.all([
                axios.get(`${API}/personnel`),
                axios.get(`${API}/equipment`),
                axios.get(`${API}/duties`)
            ]);

            setPersonnel(p.data);
            setEquipment(e.data);
            setDuties(d.data);

        } catch (error) {

            console.error("Backend connection error:", error);

        } finally {

            setLoading(false);

        }
    };

    /* ================= PERSONNEL ================= */

    const handlePersonnelSubmit = async (e) => {

        e.preventDefault();

        if (!isAdmin) {
            alert("Only Administrator can modify personnel records.");
            return;
        }

        try {

            if (editingPersonnel) {

                await axios.put(
                    `${API}/personnel/${editingPersonnel.id}`,
                    personnelForm
                );

            } else {

                await axios.post(
                    `${API}/personnel`,
                    personnelForm
                );

            }

            resetPersonnelForm();

            await loadAllData();

        } catch (error) {

            console.error("PERSONNEL SAVE ERROR:", error);

            if (error.response) {

                alert(
                    "Save failed!\n\n" +
                    "Status: " +
                    error.response.status +
                    "\nMessage: " +
                    (
                        typeof error.response.data === "string"
                            ? error.response.data
                            : JSON.stringify(error.response.data)
                    )
                );

            } else {

                alert(
                    "Cannot connect to backend.\n\n" +
                    error.message
                );

            }
        }
    };

    const editPersonnel = (person) => {

        if (!isAdmin) {
            alert("Only Administrator can edit personnel.");
            return;
        }

        setPersonnelForm({
            serviceNumber: person.serviceNumber || "",
            name: person.name || "",
            rank: person.rank || "",
            unit: person.unit || "",
            contactNumber: person.contactNumber || "",
            email: person.email || ""
        });

        setEditingPersonnel(person);
        setShowPersonnelForm(true);
    };

    const deletePersonnel = async (id) => {

        if (!isAdmin) {
            alert("Only Administrator can delete personnel.");
            return;
        }

        if (!window.confirm("Delete this personnel record?")) {
            return;
        }

        try {

            await axios.delete(`${API}/personnel/${id}`);

            await loadAllData();

        } catch (error) {

            console.error(error);
            alert("Unable to delete personnel.");

        }
    };

    const resetPersonnelForm = () => {

        setPersonnelForm({
            serviceNumber: "",
            name: "",
            rank: "",
            unit: "",
            contactNumber: "",
            email: ""
        });

        setEditingPersonnel(null);
        setShowPersonnelForm(false);
    };

    /* ================= EQUIPMENT ================= */

    const handleEquipmentSubmit = async (e) => {

        e.preventDefault();

        if (!isAdmin) {
            alert("Only Administrator can modify equipment records.");
            return;
        }

        try {

            const data = {
                ...equipmentForm,
                quantity: Number(equipmentForm.quantity)
            };

            if (editingEquipment) {

                await axios.put(
                    `${API}/equipment/${editingEquipment.id}`,
                    data
                );

            } else {

                await axios.post(
                    `${API}/equipment`,
                    data
                );

            }

            resetEquipmentForm();

            await loadAllData();

        } catch (error) {

            console.error("EQUIPMENT SAVE ERROR:", error);

            if (error.response) {

                alert(
                    "Equipment save failed!\n\n" +
                    "Status: " +
                    error.response.status +
                    "\nMessage: " +
                    (
                        typeof error.response.data === "string"
                            ? error.response.data
                            : JSON.stringify(error.response.data)
                    )
                );

            } else {

                alert(
                    "Cannot connect to backend.\n\n" +
                    error.message
                );

            }
        }
    };

    const editEquipment = (item) => {

        if (!isAdmin) {
            alert("Only Administrator can edit equipment.");
            return;
        }

        setEquipmentForm({
            equipmentName: item.equipmentName || "",
            equipmentCode: item.equipmentCode || "",
            category: item.category || "",
            quantity: item.quantity ?? "",
            status: item.status || "Available"
        });

        setEditingEquipment(item);
        setShowEquipmentForm(true);
    };

    const deleteEquipment = async (id) => {

        if (!isAdmin) {
            alert("Only Administrator can delete equipment.");
            return;
        }

        if (!window.confirm("Delete this equipment record?")) {
            return;
        }

        try {

            await axios.delete(`${API}/equipment/${id}`);

            await loadAllData();

        } catch (error) {

            console.error(error);
            alert("Unable to delete equipment.");

        }
    };

    const resetEquipmentForm = () => {

        setEquipmentForm({
            equipmentName: "",
            equipmentCode: "",
            category: "",
            quantity: "",
            status: "Available"
        });

        setEditingEquipment(null);
        setShowEquipmentForm(false);
    };

    /* ================= DUTIES ================= */

    const handleDutySubmit = async (e) => {

        e.preventDefault();

        if (!isAdmin) {
            alert("Only Administrator can modify duties.");
            return;
        }

        try {

            if (editingDuty) {

                await axios.put(
                    `${API}/duties/${editingDuty.id}`,
                    dutyForm
                );

            } else {

                await axios.post(
                    `${API}/duties`,
                    dutyForm
                );

            }

            resetDutyForm();

            await loadAllData();

        } catch (error) {

            console.error("DUTY SAVE ERROR:", error);

            if (error.response) {

                alert(
                    "Duty save failed!\n\n" +
                    "Status: " +
                    error.response.status +
                    "\nMessage: " +
                    (
                        typeof error.response.data === "string"
                            ? error.response.data
                            : JSON.stringify(error.response.data)
                    )
                );

            } else {

                alert(
                    "Cannot connect to backend.\n\n" +
                    error.message
                );

            }
        }
    };

    const editDuty = (duty) => {

        if (!isAdmin) {
            alert("Only Administrator can edit duties.");
            return;
        }

        setDutyForm({
            dutyName: duty.dutyName || "",
            assignedTo: duty.assignedTo || "",
            dutyDate: duty.dutyDate || "",
            shift: duty.shift || "",
            location: duty.location || "",
            status: duty.status || "Assigned"
        });

        setEditingDuty(duty);
        setShowDutyForm(true);
    };

    const deleteDuty = async (id) => {

        if (!isAdmin) {
            alert("Only Administrator can delete duties.");
            return;
        }

        if (!window.confirm("Delete this duty?")) {
            return;
        }

        try {

            await axios.delete(`${API}/duties/${id}`);

            await loadAllData();

        } catch (error) {

            console.error(error);
            alert("Unable to delete duty.");

        }
    };

    const resetDutyForm = () => {

        setDutyForm({
            dutyName: "",
            assignedTo: "",
            dutyDate: "",
            shift: "",
            location: "",
            status: "Assigned"
        });

        setEditingDuty(null);
        setShowDutyForm(false);
    };

    /* ================= FILTER ================= */

    const filteredPersonnel = personnel.filter((person) => {

        const value = search.toLowerCase();

        return (
            String(person.serviceNumber || "")
                .toLowerCase()
                .includes(value) ||

            String(person.name || "")
                .toLowerCase()
                .includes(value) ||

            String(person.rank || "")
                .toLowerCase()
                .includes(value) ||

            String(person.unit || "")
                .toLowerCase()
                .includes(value)
        );
    });

    /* ================= DASHBOARD ================= */

    const totalEquipment = equipment.reduce(
        (sum, item) =>
            sum + Number(item.quantity || 0),
        0
    );

    const availableEquipment = equipment
        .filter(
            item =>
                String(item.status || "")
                    .toLowerCase() === "available"
        )
        .reduce(
            (sum, item) =>
                sum + Number(item.quantity || 0),
            0
        );

    /* ================= LOGIN SCREEN ================= */

    if (!loggedInUser) {
        return <Login onLogin={handleLogin} />;
    }

    /* ================= MAIN UI ================= */

    return (

        <div className="app">

            {/* ================= SIDEBAR ================= */}

            <aside className="sidebar">

                <div className="brand">

                    <div className="shield">
                        🛡️
                    </div>

                    <div>
                        <h2>CampGuard</h2>
                        <span>
                            Army Camp Management
                        </span>
                    </div>

                </div>


                <div className="menu">

                    <button
                        className={
                            page === "Dashboard"
                                ? "menu-active"
                                : ""
                        }
                        onClick={() => {
                            setPage("Dashboard");
                            navigate("/dashboard");
                        }}
                    >
                        🏠 <span>Dashboard</span>
                    </button>


                    <button
                        className={
                            page === "Personnel"
                                ? "menu-active"
                                : ""
                        }
                        onClick={() => {
                            setPage("Personnel");
                            navigate("/personnel");
                        }}
                    >
                        👤 <span>Personnel</span>
                    </button>


                    <button
                        className={
                            page === "Equipment"
                                ? "menu-active"
                                : ""
                        }
                        onClick={() => {
                            setPage("Equipment");
                            navigate("/equipment");
                        }}
                    >
                        🎒 <span>Equipment</span>
                    </button>


                    <button
                        className={
                            page === "Duties"
                                ? "menu-active"
                                : ""
                        }
                        onClick={() => {
                            setPage("Duties");
                            navigate("/duties");
                        }}
                    >
                        📋 <span>Duties</span>
                    </button>


                    <button
                        className={
                            page === "Reports"
                                ? "menu-active"
                                : ""
                        }
                        onClick={() => {
                            setPage("Reports");
                            navigate("/reports");
                        }}
                    >
                        📊 <span>Reports</span>
                    </button>

                </div>


                <div className="sidebar-bottom">

                    <div>
                        🔒 Authorized Access
                    </div>

                    <small>
                        CampGuard v1.0
                    </small>

                </div>

            </aside>


            {/* ================= MAIN ================= */}

            <main className="main">

                {/* ================= TOPBAR ================= */}

                <header className="topbar">

                    <div>

                        <h1>
                            {page}
                        </h1>

                        <p>
                            CampGuard Army Camp Management System
                        </p>

                    </div>


                    <div className="admin">

                        <div className="admin-icon">
                            {isAdmin ? "A" : "U"}
                        </div>


                        <div>

                            <strong>
                                {isAdmin
                                    ? "Administrator"
                                    : "Authorized User"}
                            </strong>

                            <span>
                                {loggedInUser.username}
                            </span>

                        </div>


                        <button
                            className="logout-button"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>

                    </div>

                </header>


                {/* ================= CONTENT ================= */}

                <section className="content">

                    {/* =====================================================
                        DASHBOARD
                    ===================================================== */}

                    {page === "Dashboard" && (

                        <>

                            <div className="welcome">

                                <div>

                                    <h2>
                                        Welcome to CampGuard
                                    </h2>

                                    <p>
                                        Centralized management of personnel,
                                        equipment and duty assignments.
                                    </p>

                                </div>


                                <div className="welcome-icon">
                                    🛡️
                                </div>

                            </div>


                            <div className="stat-grid">

                                <div className="stat-card">

                                    <div className="stat-icon blue">
                                        👤
                                    </div>

                                    <div>

                                        <span>
                                            Total Personnel
                                        </span>

                                        <h2>
                                            {personnel.length}
                                        </h2>

                                    </div>

                                </div>


                                <div className="stat-card">

                                    <div className="stat-icon green">
                                        🎒
                                    </div>

                                    <div>

                                        <span>
                                            Total Equipment
                                        </span>

                                        <h2>
                                            {totalEquipment}
                                        </h2>

                                    </div>

                                </div>


                                <div className="stat-card">

                                    <div className="stat-icon orange">
                                        📋
                                    </div>

                                    <div>

                                        <span>
                                            Active Duties
                                        </span>

                                        <h2>
                                            {duties.length}
                                        </h2>

                                    </div>

                                </div>


                                <div className="stat-card">

                                    <div className="stat-icon purple">
                                        ✓
                                    </div>

                                    <div>

                                        <span>
                                            Available Equipment
                                        </span>

                                        <h2>
                                            {availableEquipment}
                                        </h2>

                                    </div>

                                </div>

                            </div>


                            <div className="dashboard-grid">

                                <div className="panel">

                                    <div className="panel-title">

                                        <h3>
                                            Recent Personnel
                                        </h3>

                                        <button
                                            className="text-button"
                                            onClick={() => {
                                                setPage("Personnel");
                                                navigate("/personnel");
                                            }}
                                        >
                                            View All
                                        </button>

                                    </div>


                                    {personnel.length === 0 ? (

                                        <div className="empty">
                                            No personnel records found.
                                        </div>

                                    ) : (

                                        <table>

                                            <thead>

                                            <tr>
                                                <th>Service No.</th>
                                                <th>Name</th>
                                                <th>Rank</th>
                                                <th>Unit</th>
                                            </tr>

                                            </thead>


                                            <tbody>

                                            {personnel
                                                .slice(0, 5)
                                                .map((person) => (

                                                    <tr
                                                        key={person.id}
                                                    >

                                                        <td>
                                                            <strong>
                                                                {person.serviceNumber}
                                                            </strong>
                                                        </td>

                                                        <td>
                                                            {person.name}
                                                        </td>

                                                        <td>
                                                            {person.rank}
                                                        </td>

                                                        <td>
                                                            {person.unit}
                                                        </td>

                                                    </tr>

                                                ))}

                                            </tbody>

                                        </table>

                                    )}

                                </div>


                                <div className="panel">

                                    <div className="panel-title">

                                        <h3>
                                            System Status
                                        </h3>

                                    </div>


                                    <div className="status-list">

                                        <div>
                                            <span>
                                                Backend API
                                            </span>

                                            <b className="online">
                                                ● Online
                                            </b>
                                        </div>


                                        <div>
                                            <span>
                                                Personnel Database
                                            </span>

                                            <b className="online">
                                                ● Connected
                                            </b>
                                        </div>


                                        <div>
                                            <span>
                                                Equipment Database
                                            </span>

                                            <b className="online">
                                                ● Connected
                                            </b>
                                        </div>


                                        <div>
                                            <span>
                                                Duties Database
                                            </span>

                                            <b className="online">
                                                ● Connected
                                            </b>
                                        </div>

                                    </div>

                                </div>

                            </div>

                        </>

                    )}


                    {/* =====================================================
                        PERSONNEL
                    ===================================================== */}

                    {page === "Personnel" && (

                        <div>

                            <div className="page-heading">

                                <div>

                                    <h2>
                                        Personnel Management
                                    </h2>

                                    <p>
                                        Add, search, update and manage camp personnel.
                                    </p>

                                </div>


                                {isAdmin && (

                                    <button
                                        className="primary-button"
                                        onClick={() => {

                                            resetPersonnelForm();
                                            setShowPersonnelForm(true);

                                        }}
                                    >
                                        + Add Personnel
                                    </button>

                                )}

                            </div>


                            {showPersonnelForm && isAdmin && (

                                <div className="form-panel">

                                    <div className="form-header">

                                        <h3>

                                            {editingPersonnel
                                                ? "Update Personnel"
                                                : "Add New Personnel"}

                                        </h3>


                                        <button
                                            type="button"
                                            onClick={resetPersonnelForm}
                                        >
                                            ✕
                                        </button>

                                    </div>


                                    <form
                                        onSubmit={
                                            handlePersonnelSubmit
                                        }
                                    >

                                        <div className="form-grid">

                                            <input
                                                placeholder="Service Number *"
                                                required
                                                value={
                                                    personnelForm.serviceNumber
                                                }
                                                onChange={(e) =>
                                                    setPersonnelForm({
                                                        ...personnelForm,
                                                        serviceNumber:
                                                        e.target.value
                                                    })
                                                }
                                            />


                                            <input
                                                placeholder="Name *"
                                                required
                                                value={
                                                    personnelForm.name
                                                }
                                                onChange={(e) =>
                                                    setPersonnelForm({
                                                        ...personnelForm,
                                                        name:
                                                        e.target.value
                                                    })
                                                }
                                            />


                                            <input
                                                placeholder="Rank"
                                                value={
                                                    personnelForm.rank
                                                }
                                                onChange={(e) =>
                                                    setPersonnelForm({
                                                        ...personnelForm,
                                                        rank:
                                                        e.target.value
                                                    })
                                                }
                                            />


                                            <input
                                                placeholder="Unit"
                                                value={
                                                    personnelForm.unit
                                                }
                                                onChange={(e) =>
                                                    setPersonnelForm({
                                                        ...personnelForm,
                                                        unit:
                                                        e.target.value
                                                    })
                                                }
                                            />


                                            <input
                                                placeholder="Contact Number"
                                                value={
                                                    personnelForm.contactNumber
                                                }
                                                onChange={(e) =>
                                                    setPersonnelForm({
                                                        ...personnelForm,
                                                        contactNumber:
                                                        e.target.value
                                                    })
                                                }
                                            />


                                            <input
                                                type="email"
                                                placeholder="Email"
                                                value={
                                                    personnelForm.email
                                                }
                                                onChange={(e) =>
                                                    setPersonnelForm({
                                                        ...personnelForm,
                                                        email:
                                                        e.target.value
                                                    })
                                                }
                                            />

                                        </div>


                                        <div className="form-actions">

                                            <button
                                                type="button"
                                                className="cancel-button"
                                                onClick={
                                                    resetPersonnelForm
                                                }
                                            >
                                                Cancel
                                            </button>


                                            <button
                                                type="submit"
                                                className="primary-button"
                                            >
                                                {editingPersonnel
                                                    ? "Update"
                                                    : "Save Personnel"}
                                            </button>

                                        </div>

                                    </form>

                                </div>

                            )}


                            {!isAdmin && (

                                <div className="info-message">
                                    👁️ You are logged in as an Authorized
                                    User. You can view personnel records but
                                    cannot add, edit or delete them.
                                </div>

                            )}


                            <div className="panel">

                                <div className="table-toolbar">

                                    <div>

                                        <h3>
                                            Personnel Records
                                        </h3>

                                        <span>
                                            {personnel.length} records
                                        </span>

                                    </div>


                                    <input
                                        className="search"
                                        placeholder="Search personnel..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                    />

                                </div>


                                {loading ? (

                                    <div className="empty">
                                        Loading records...
                                    </div>

                                ) : filteredPersonnel.length === 0 ? (

                                    <div className="empty">
                                        No personnel records found.
                                    </div>

                                ) : (

                                    <div className="table-container">

                                        <table>

                                            <thead>

                                            <tr>
                                                <th>Service Number</th>
                                                <th>Name</th>
                                                <th>Rank</th>
                                                <th>Unit</th>
                                                <th>Contact</th>
                                                <th>Email</th>
                                                {isAdmin && (
                                                    <th>Actions</th>
                                                )}
                                            </tr>

                                            </thead>


                                            <tbody>

                                            {filteredPersonnel.map(
                                                (person) => (

                                                    <tr
                                                        key={person.id}
                                                    >

                                                        <td>
                                                            <strong>
                                                                {
                                                                    person.serviceNumber
                                                                }
                                                            </strong>
                                                        </td>

                                                        <td>
                                                            {person.name}
                                                        </td>

                                                        <td>
                                                                <span className="badge">
                                                                    {
                                                                        person.rank
                                                                    }
                                                                </span>
                                                        </td>

                                                        <td>
                                                            {person.unit}
                                                        </td>

                                                        <td>
                                                            {
                                                                person.contactNumber
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                person.email
                                                            }
                                                        </td>


                                                        {isAdmin && (

                                                            <td>

                                                                <div className="actions">

                                                                    <button
                                                                        className="edit"
                                                                        onClick={() =>
                                                                            editPersonnel(
                                                                                person
                                                                            )
                                                                        }
                                                                    >
                                                                        Edit
                                                                    </button>


                                                                    <button
                                                                        className="delete"
                                                                        onClick={() =>
                                                                            deletePersonnel(
                                                                                person.id
                                                                            )
                                                                        }
                                                                    >
                                                                        Delete
                                                                    </button>

                                                                </div>

                                                            </td>

                                                        )}

                                                    </tr>

                                                )
                                            )}

                                            </tbody>

                                        </table>

                                    </div>

                                )}

                            </div>

                        </div>

                    )}


                    {/* =====================================================
                        EQUIPMENT
                    ===================================================== */}

                    {page === "Equipment" && (

                        <div>

                            <div className="page-heading">

                                <div>

                                    <h2>
                                        Equipment Management
                                    </h2>

                                    <p>
                                        Track camp equipment and availability.
                                    </p>

                                </div>


                                {isAdmin && (

                                    <button
                                        className="primary-button"
                                        onClick={() => {

                                            resetEquipmentForm();
                                            setShowEquipmentForm(true);

                                        }}
                                    >
                                        + Add Equipment
                                    </button>

                                )}

                            </div>


                            {showEquipmentForm && isAdmin && (

                                <div className="form-panel">

                                    <div className="form-header">

                                        <h3>

                                            {editingEquipment
                                                ? "Update Equipment"
                                                : "Add New Equipment"}

                                        </h3>


                                        <button
                                            type="button"
                                            onClick={
                                                resetEquipmentForm
                                            }
                                        >
                                            ✕
                                        </button>

                                    </div>


                                    <form
                                        onSubmit={
                                            handleEquipmentSubmit
                                        }
                                    >

                                        <div className="form-grid">

                                            <input
                                                placeholder="Equipment Name *"
                                                required
                                                value={
                                                    equipmentForm.equipmentName
                                                }
                                                onChange={(e) =>
                                                    setEquipmentForm({
                                                        ...equipmentForm,
                                                        equipmentName:
                                                        e.target.value
                                                    })
                                                }
                                            />


                                            <input
                                                placeholder="Equipment Code"
                                                value={
                                                    equipmentForm.equipmentCode
                                                }
                                                onChange={(e) =>
                                                    setEquipmentForm({
                                                        ...equipmentForm,
                                                        equipmentCode:
                                                        e.target.value
                                                    })
                                                }
                                            />


                                            <input
                                                placeholder="Category"
                                                value={
                                                    equipmentForm.category
                                                }
                                                onChange={(e) =>
                                                    setEquipmentForm({
                                                        ...equipmentForm,
                                                        category:
                                                        e.target.value
                                                    })
                                                }
                                            />


                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="Quantity"
                                                value={
                                                    equipmentForm.quantity
                                                }
                                                onChange={(e) =>
                                                    setEquipmentForm({
                                                        ...equipmentForm,
                                                        quantity:
                                                        e.target.value
                                                    })
                                                }
                                            />


                                            <select
                                                value={
                                                    equipmentForm.status
                                                }
                                                onChange={(e) =>
                                                    setEquipmentForm({
                                                        ...equipmentForm,
                                                        status:
                                                        e.target.value
                                                    })
                                                }
                                            >

                                                <option>
                                                    Available
                                                </option>

                                                <option>
                                                    Issued
                                                </option>

                                                <option>
                                                    Maintenance
                                                </option>

                                                <option>
                                                    Unavailable
                                                </option>

                                            </select>

                                        </div>


                                        <div className="form-actions">

                                            <button
                                                type="button"
                                                className="cancel-button"
                                                onClick={
                                                    resetEquipmentForm
                                                }
                                            >
                                                Cancel
                                            </button>


                                            <button
                                                type="submit"
                                                className="primary-button"
                                            >
                                                {editingEquipment
                                                    ? "Update"
                                                    : "Save Equipment"}
                                            </button>

                                        </div>

                                    </form>

                                </div>

                            )}


                            {!isAdmin && (

                                <div className="info-message">
                                    👁️ You are logged in as an Authorized
                                    User. You can view equipment records but
                                    cannot add, edit or delete them.
                                </div>

                            )}


                            <div className="panel">

                                <div className="table-toolbar">

                                    <div>

                                        <h3>
                                            Equipment Records
                                        </h3>

                                        <span>
                                            {equipment.length} records
                                        </span>

                                    </div>

                                </div>


                                {equipment.length === 0 ? (

                                    <div className="empty">
                                        No equipment records found.
                                    </div>

                                ) : (

                                    <div className="table-container">

                                        <table>

                                            <thead>

                                            <tr>
                                                <th>Name</th>
                                                <th>Code</th>
                                                <th>Category</th>
                                                <th>Quantity</th>
                                                <th>Status</th>

                                                {isAdmin && (
                                                    <th>Actions</th>
                                                )}

                                            </tr>

                                            </thead>


                                            <tbody>

                                            {equipment.map(
                                                (item) => (

                                                    <tr
                                                        key={item.id}
                                                    >

                                                        <td>
                                                            <strong>
                                                                {
                                                                    item.equipmentName
                                                                }
                                                            </strong>
                                                        </td>

                                                        <td>
                                                            {
                                                                item.equipmentCode
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                item.category
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                item.quantity
                                                            }
                                                        </td>

                                                        <td>

                                                                <span
                                                                    className={
                                                                        String(
                                                                            item.status
                                                                        )
                                                                            .toLowerCase() ===
                                                                        "available"
                                                                            ? "status available"
                                                                            : "status issued"
                                                                    }
                                                                >
                                                                    {
                                                                        item.status
                                                                    }
                                                                </span>

                                                        </td>


                                                        {isAdmin && (

                                                            <td>

                                                                <div className="actions">

                                                                    <button
                                                                        className="edit"
                                                                        onClick={() =>
                                                                            editEquipment(
                                                                                item
                                                                            )
                                                                        }
                                                                    >
                                                                        Edit
                                                                    </button>


                                                                    <button
                                                                        className="delete"
                                                                        onClick={() =>
                                                                            deleteEquipment(
                                                                                item.id
                                                                            )
                                                                        }
                                                                    >
                                                                        Delete
                                                                    </button>

                                                                </div>

                                                            </td>

                                                        )}

                                                    </tr>

                                                )
                                            )}

                                            </tbody>

                                        </table>

                                    </div>

                                )}

                            </div>

                        </div>

                    )}


                    {/* =====================================================
                        DUTIES
                    ===================================================== */}

                    {page === "Duties" && (

                        <div>

                            <div className="page-heading">

                                <div>

                                    <h2>
                                        Duty Management
                                    </h2>

                                    <p>
                                        Manage personnel duty assignments.
                                    </p>

                                </div>


                                {isAdmin && (

                                    <button
                                        className="primary-button"
                                        onClick={() => {

                                            resetDutyForm();
                                            setShowDutyForm(true);

                                        }}
                                    >
                                        + Assign Duty
                                    </button>

                                )}

                            </div>


                            {showDutyForm && isAdmin && (

                                <div className="form-panel">

                                    <div className="form-header">

                                        <h3>

                                            {editingDuty
                                                ? "Update Duty"
                                                : "Create Duty Assignment"}

                                        </h3>


                                        <button
                                            type="button"
                                            onClick={resetDutyForm}
                                        >
                                            ✕
                                        </button>

                                    </div>


                                    <form
                                        onSubmit={
                                            handleDutySubmit
                                        }
                                    >

                                        <div className="form-grid">

                                            <input
                                                placeholder="Duty Name *"
                                                required
                                                value={
                                                    dutyForm.dutyName
                                                }
                                                onChange={(e) =>
                                                    setDutyForm({
                                                        ...dutyForm,
                                                        dutyName:
                                                        e.target.value
                                                    })
                                                }
                                            />


                                            <input
                                                placeholder="Assigned Personnel"
                                                value={
                                                    dutyForm.assignedTo
                                                }
                                                onChange={(e) =>
                                                    setDutyForm({
                                                        ...dutyForm,
                                                        assignedTo:
                                                        e.target.value
                                                    })
                                                }
                                            />


                                            <input
                                                type="date"
                                                value={
                                                    dutyForm.dutyDate
                                                }
                                                onChange={(e) =>
                                                    setDutyForm({
                                                        ...dutyForm,
                                                        dutyDate:
                                                        e.target.value
                                                    })
                                                }
                                            />


                                            <select
                                                value={
                                                    dutyForm.shift
                                                }
                                                onChange={(e) =>
                                                    setDutyForm({
                                                        ...dutyForm,
                                                        shift:
                                                        e.target.value
                                                    })
                                                }
                                            >

                                                <option value="">
                                                    Select Shift
                                                </option>

                                                <option>
                                                    Morning
                                                </option>

                                                <option>
                                                    Afternoon
                                                </option>

                                                <option>
                                                    Night
                                                </option>

                                            </select>


                                            <input
                                                placeholder="Location"
                                                value={
                                                    dutyForm.location
                                                }
                                                onChange={(e) =>
                                                    setDutyForm({
                                                        ...dutyForm,
                                                        location:
                                                        e.target.value
                                                    })
                                                }
                                            />


                                            <select
                                                value={
                                                    dutyForm.status
                                                }
                                                onChange={(e) =>
                                                    setDutyForm({
                                                        ...dutyForm,
                                                        status:
                                                        e.target.value
                                                    })
                                                }
                                            >

                                                <option>
                                                    Assigned
                                                </option>

                                                <option>
                                                    In Progress
                                                </option>

                                                <option>
                                                    Completed
                                                </option>

                                                <option>
                                                    Cancelled
                                                </option>

                                            </select>

                                        </div>


                                        <div className="form-actions">

                                            <button
                                                type="button"
                                                className="cancel-button"
                                                onClick={
                                                    resetDutyForm
                                                }
                                            >
                                                Cancel
                                            </button>


                                            <button
                                                type="submit"
                                                className="primary-button"
                                            >
                                                {editingDuty
                                                    ? "Update Duty"
                                                    : "Save Duty"}
                                            </button>

                                        </div>

                                    </form>

                                </div>

                            )}


                            {!isAdmin && (

                                <div className="info-message">
                                    👁️ You are logged in as an Authorized
                                    User. You can view duty assignments but
                                    cannot add, edit or delete them.
                                </div>

                            )}


                            <div className="panel">

                                <div className="table-toolbar">

                                    <div>

                                        <h3>
                                            Duty Assignments
                                        </h3>

                                        <span>
                                            {duties.length} assignments
                                        </span>

                                    </div>

                                </div>


                                {duties.length === 0 ? (

                                    <div className="empty">
                                        No duty assignments found.
                                    </div>

                                ) : (

                                    <div className="table-container">

                                        <table>

                                            <thead>

                                            <tr>
                                                <th>Duty</th>
                                                <th>Assigned To</th>
                                                <th>Date</th>
                                                <th>Shift</th>
                                                <th>Location</th>
                                                <th>Status</th>

                                                {isAdmin && (
                                                    <th>Actions</th>
                                                )}

                                            </tr>

                                            </thead>


                                            <tbody>

                                            {duties.map(
                                                (duty) => (

                                                    <tr
                                                        key={duty.id}
                                                    >

                                                        <td>
                                                            <strong>
                                                                {
                                                                    duty.dutyName
                                                                }
                                                            </strong>
                                                        </td>

                                                        <td>
                                                            {
                                                                duty.assignedTo
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                duty.dutyDate
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                duty.shift
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                duty.location
                                                            }
                                                        </td>

                                                        <td>

                                                                <span className="badge">
                                                                    {
                                                                        duty.status
                                                                    }
                                                                </span>

                                                        </td>


                                                        {isAdmin && (

                                                            <td>

                                                                <div className="actions">

                                                                    <button
                                                                        className="edit"
                                                                        onClick={() =>
                                                                            editDuty(
                                                                                duty
                                                                            )
                                                                        }
                                                                    >
                                                                        Edit
                                                                    </button>


                                                                    <button
                                                                        className="delete"
                                                                        onClick={() =>
                                                                            deleteDuty(
                                                                                duty.id
                                                                            )
                                                                        }
                                                                    >
                                                                        Delete
                                                                    </button>

                                                                </div>

                                                            </td>

                                                        )}

                                                    </tr>

                                                )
                                            )}

                                            </tbody>

                                        </table>

                                    </div>

                                )}

                            </div>

                        </div>

                    )}


                    {/* =====================================================
                        REPORTS
                    ===================================================== */}

                    {page === "Reports" && (

                        <div>

                            <div className="page-heading">

                                <div>

                                    <h2>
                                        Camp Reports
                                    </h2>

                                    <p>
                                        Overview of CampGuard records.
                                    </p>

                                </div>

                            </div>


                            <div className="report-grid">

                                <div className="report-card">

                                    <span>
                                        Total Personnel
                                    </span>

                                    <strong>
                                        {personnel.length}
                                    </strong>

                                </div>


                                <div className="report-card">

                                    <span>
                                        Equipment Types
                                    </span>

                                    <strong>
                                        {equipment.length}
                                    </strong>

                                </div>


                                <div className="report-card">

                                    <span>
                                        Total Equipment Units
                                    </span>

                                    <strong>
                                        {totalEquipment}
                                    </strong>

                                </div>


                                <div className="report-card">

                                    <span>
                                        Total Duties
                                    </span>

                                    <strong>
                                        {duties.length}
                                    </strong>

                                </div>

                            </div>


                            <div className="panel">

                                <div className="panel-title">

                                    <h3>
                                        Personnel Report
                                    </h3>

                                </div>


                                <div className="table-container">

                                    <table>

                                        <thead>

                                        <tr>
                                            <th>
                                                Service Number
                                            </th>

                                            <th>
                                                Name
                                            </th>

                                            <th>
                                                Rank
                                            </th>

                                            <th>
                                                Unit
                                            </th>
                                        </tr>

                                        </thead>


                                        <tbody>

                                        {personnel.map(
                                            (person) => (

                                                <tr
                                                    key={person.id}
                                                >

                                                    <td>
                                                        {
                                                            person.serviceNumber
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            person.name
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            person.rank
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            person.unit
                                                        }
                                                    </td>

                                                </tr>

                                            )
                                        )}

                                        </tbody>

                                    </table>

                                </div>

                            </div>

                        </div>

                    )}

                </section>

            </main>

        </div>
    );
}

function AppWithRouter() {
    return (
        <BrowserRouter>
            <App />
        </BrowserRouter>
    );
}

export default AppWithRouter;
