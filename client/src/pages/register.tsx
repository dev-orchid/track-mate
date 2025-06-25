// client/pages/register.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';

const Register: React.FC = () => {
	const router = useRouter();
	const [form, setForm] = useState({ firstName: '', lastName: '', email: '', company_name: '', password: '' });
	const [error, setError] = useState('');
	const [message, setMessage] = useState('');
	const [loading, setLoading] = useState(false);

	// Handle input field changes
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError('');
		setMessage('');

		try {
			// Adjust the URL if your Express server is hosted elsewhere.
			const res = await fetch('http://localhost:8000/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(form),
			});

			const data = await res.json();

			if (!res.ok) {
				setError(data.message || 'Registration failed');
			} else {
				setMessage(data.message);
				// Optionally, redirect to a login page after a delay
				setTimeout(() => {
					router.push('/login');
				}, 2000);
			}
		} catch (err) {
			console.error('Registration error:', err);
			setError('An unexpected error occurred.');
		}

		setLoading(false);
	};

	return (

		<>

			<div className="container">


				{/* Nested Row within Card Body */}
				<div className="row justify-content-center">

					<div className="col-lg-7">
						<div className="card o-hidden border-0 shadow-lg my-5">
							<div className="card-body p-0">
								<div className="p-5">
									<div className="text-center">
										<h1 className="h4 text-gray-900 mb-4"><b>Create an Account! </b></h1>
									</div>
									<form className="user" onSubmit={handleSubmit}>
										<div className="form-group row">
											<div className="col-sm-6 mb-3 mb-sm-0">
												<input
													type="text"
													className="form-control form-control-user"
													id="firstName"
													name="firstName"
													value={form.firstName}
													onChange={handleChange}
													placeholder="First Name"
													required
												/>
											</div>
											<div className="col-sm-6">
												<input
													type="text"
													className="form-control form-control-user"
													id="lastName"
													name="lastName"
													value={form.lastName}
													onChange={handleChange}
													placeholder="Last Name"
													required
												/>
											</div>
										</div>
										<div className="form-group">
											<input
												type="email"
												className="form-control form-control-user"
												id="email"
												name="email"
												value={form.email}
												onChange={handleChange}
												placeholder="Email Address"
												required
											/>
										</div>
										<div className="form-group row">
											<div className="col-sm-6 mb-3 mb-sm-0">
												<input
													type="password"
													className="form-control form-control-user"
													id="password"
													name="password"
													value={form.password}
													onChange={handleChange}
													placeholder="Password"
													required
												/>
											</div>
											<div className="col-sm-6">
												<input
													type="text"
													className="form-control form-control-user"
													id="company_name"
													name="company_name"
													value={form.company_name}
													onChange={handleChange}
													placeholder="Enter your company!"
													required
												/>
											</div>
										</div>
										{error && <p style={{ color: 'orange', marginBottom: '1rem' }}>{error}</p>}
										{message && <p style={{ color: 'green', marginBottom: '1rem' }}>{message}</p>}
										<button type="submit" className="btn btn-primary btn-user btn-block" disabled={loading} style={{ padding: '0.5rem 1rem' }}>
											{loading ? 'Registering...' : 'Register'}
										</button>

										<hr />

										<button type="button" className="btn btn-google btn-user btn-block">
											<i className="fab fa-google fa-fw"></i> Register with Google
										</button>


									</form>
									<hr />
									<div className="text-center">
										<a className="small" href="/forgot-password">
											Forgot Password?
										</a>
									</div>
									<div className="text-center">
										<a className="small" href="/login">
											Already have an account? Login!
										</a>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>



		</>
	);
};

export default Register;
