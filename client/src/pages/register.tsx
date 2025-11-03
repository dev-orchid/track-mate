import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axiosInstance from '../utils/axiosInstance';

const Register: React.FC = () => {
	const router = useRouter();
	const [form, setForm] = useState({ firstName: '', lastName: '', email: '', company_name: '', password: '' });
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [loading, setLoading] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError('');
		setSuccess('');

		try {
			const res = await axiosInstance.post('/register', form);

			if (res.data.success) {
				setSuccess('Account created successfully! Redirecting to login...');
				setTimeout(() => {
					router.push('/login');
				}, 2000);
			} else {
				setError(res.data.message || 'Registration failed');
				setLoading(false);
			}
		} catch (err: any) {
			console.error('Registration error:', err);
			setError(err.response?.data?.message || 'An error occurred. Please try again.');
			setLoading(false);
		}
	};

	return (
		<div className="auth-wrapper">
			<div className="auth-banner" />
			<div className="auth-container">
				<div className="auth-card">
					<div className="auth-header">
						<h1 className="auth-title">Create Account</h1>
						<p className="auth-subtitle">Start tracking user analytics today</p>
					</div>

					<form onSubmit={handleSubmit} className="auth-form">
						{error && (
							<div className="alert-error">
								{error}
							</div>
						)}

						{success && (
							<div className="alert-success">
								{success}
							</div>
						)}

						<div className="form-row-modern">
							<div className="form-group-modern">
								<label htmlFor="firstName">First Name</label>
								<input
									type="text"
									id="firstName"
									name="firstName"
									value={form.firstName}
									onChange={handleChange}
									placeholder="John"
									required
									className="input-modern"
								/>
							</div>

							<div className="form-group-modern">
								<label htmlFor="lastName">Last Name</label>
								<input
									type="text"
									id="lastName"
									name="lastName"
									value={form.lastName}
									onChange={handleChange}
									placeholder="Doe"
									required
									className="input-modern"
								/>
							</div>
						</div>

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
							<label htmlFor="company_name">Company Name</label>
							<input
								type="text"
								id="company_name"
								name="company_name"
								value={form.company_name}
								onChange={handleChange}
								placeholder="Your company"
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
								placeholder="Create a strong password"
								required
								className="input-modern"
							/>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="btn-modern btn-primary-modern"
						>
							{loading ? 'Creating Account...' : 'Create Account'}
						</button>
					</form>

					<div className="auth-footer">
						<p>
							Already have an account?{" "}
							<Link href="/login" className="auth-link">
								Sign in
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Register;
