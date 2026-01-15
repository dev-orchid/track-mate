import React, { useState } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import axiosInstance from "../utils/axiosInstance";
import Link from "next/link";
import Image from "next/image";

const Login: React.FC = () => {
	const router = useRouter();
	const [form, setForm] = useState({ email: "", password: "" });
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

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
			<div className="auth-banner">
				<Image
					src="/images/auth-banner.svg"
					alt="Colorful umbrellas"
					fill
					style={{ objectFit: 'cover' }}
					priority
				/>
			</div>
			<div className="auth-container">
				<div className="auth-card">
					<div className="auth-logo">
						<Image
							src="/images/trackmate-logo.svg"
							alt="TrackMate"
							width={48}
							height={48}
						/>
					</div>

					<h1 className="auth-title">Welcome back to TrackMate!</h1>

					<form onSubmit={handleSubmit} className="auth-form">
						{error && (
							<div className="alert-error">
								{error}
							</div>
						)}

						<div className="form-group-modern">
							<input
								type="email"
								id="email"
								name="email"
								value={form.email}
								onChange={handleChange}
								placeholder="Email"
								required
								className="input-modern"
							/>
						</div>

						<div className="form-group-modern password-group">
							<input
								type={showPassword ? "text" : "password"}
								id="password"
								name="password"
								value={form.password}
								onChange={handleChange}
								placeholder="Password"
								required
								className="input-modern"
							/>
							<button
								type="button"
								className="password-toggle"
								onClick={() => setShowPassword(!showPassword)}
								tabIndex={-1}
							>
								{showPassword ? (
									<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
										<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
										<line x1="1" y1="1" x2="23" y2="23"/>
									</svg>
								) : (
									<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
										<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
										<circle cx="12" cy="12" r="3"/>
									</svg>
								)}
							</button>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="btn-modern btn-primary-modern"
						>
							{loading ? "Signing in..." : "Login"}
						</button>
					</form>

					<div className="auth-links">
						<Link href="/forgot-password" className="forgot-link">
							Forgot Password
						</Link>
					</div>

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
