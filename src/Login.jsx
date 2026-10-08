import { useState } from "react";
import axios from "axios";

const API = "http://localhost:8080/api";

function Login({ onLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await axios.post(`${API}/auth/login`, {
                username,
                password
            });

            onLogin(response.data);

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Invalid username or password"
            );
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#121824"
            }}
        >
            <form
                onSubmit={handleLogin}
                style={{
                    width: "380px",
                    padding: "35px",
                    background: "#1e293b",
                    borderRadius: "12px",
                    color: "white",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
                }}
            >
                <h1 style={{ marginBottom: "8px" }}>
                    🛡️ CampGuard
                </h1>

                <p style={{ color: "#cbd5e1", marginBottom: "25px" }}>
                    Army Camp Management System
                </p>

                {/* Username */}
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{
                        width: "100%",
                        padding: "12px",
                        margin: "10px 0",
                        boxSizing: "border-box",
                        borderRadius: "6px",
                        border: "1px solid #475569",
                        outline: "none"
                    }}
                />

                {/* Password + Eye Button */}
                <div
                    style={{
                        position: "relative",
                        margin: "10px 0"
                    }}
                >
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "12px",
                            paddingRight: "45px",
                            boxSizing: "border-box",
                            borderRadius: "6px",
                            border: "1px solid #475569",
                            outline: "none"
                        }}
                    />

                    <button
                        type="button"
                        onClick={() =>
                            setShowPassword(!showPassword)
                        }
                        style={{
                            position: "absolute",
                            right: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            fontSize: "18px",
                            padding: "4px"
                        }}
                        title={
                            showPassword
                                ? "Hide password"
                                : "Show password"
                        }
                    >
                        {showPassword ? "🙈" : "👁️"}
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <p
                        style={{
                            color: "#ff6b6b",
                            marginTop: "10px"
                        }}
                    >
                        {error}
                    </p>
                )}

                {/* Login Button */}
                <button
                    type="submit"
                    style={{
                        width: "100%",
                        padding: "12px",
                        marginTop: "15px",
                        cursor: "pointer",
                        border: "none",
                        borderRadius: "6px",
                        fontWeight: "bold",
                        fontSize: "15px"
                    }}
                >
                    Login
                </button>


            </form>
        </div>
    );
}

export default Login;