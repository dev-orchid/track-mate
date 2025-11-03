import React, { useState } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import axiosInstance from "../utils/axiosInstance";
import Link from "next/link";

const Login: React.FC = () => {
	const router = useRouter();
	const [form, setForm] = useState({ email: "", password: "" });
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const res = await axiosInstance.post("/login", form);

			if (!res.data.success) {
				setError(res.data.message || "Login failed");
				setLoading(false);
				return;
			}

			const { accessToken, refreshToken } = res.data;

			Cookies.set("authToken", accessToken, { expires: 7 });
			localStorage.setItem("authToken", accessToken);
			localStorage.setItem("refresh_token", refreshToken);

			router.push("/");
		} catch (error: any) {
			setError(error.response?.data?.message || "An error occurred. Please try again.");
			setLoading(false);
		}
	};

	return (
		<div className="auth-wrapper">
			<div className="auth-banner" />
			<div className="auth-container">
				<div className="auth-card">
					<div className="auth-header">
						<h1 className="auth-title">Welcome Back</h1>
						<p className="auth-subtitle">Sign in to continue to TrackMate</p>
					</div>

					<form onSubmit={handleSubmit} className="auth-form">
						{error && (
							<div className="alert-error">
								{error}
							</div>
						)}

						<div className="form-group-modern">
							<label htmlFor="email">Email Address</label>
							<input
								type="email"
								id="email"
								name="email"
								value={form.email}
								onChange={handleChange}
								placeholder="you@example.com"
								required
								className="input-modern"
							/>
						</div>

						<div className="form-group-modern">
							<label htmlFor="password">Password</label>
							<input
								type="password"
								id="password"
								name="password"
								value={form.password}
								onChange={handleChange}
								placeholder="Enter your password"
								required
								className="input-modern"
							/>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="btn-modern btn-primary-modern"
						>
							{loading ? "Signing in..." : "Sign In"}
						</button>
					</form>

					<div className="auth-footer">
						<p>
							Don't have an account?{" "}
							<Link href="/register" className="auth-link">
								Create one
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Login;
