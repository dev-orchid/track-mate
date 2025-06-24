// client/pages/login.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

const Login: React.FC = () => {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login failed');
      } else {
        Cookies.set('authToken', data.token, { expires: 7 });
        router.push('/'); // Redirect after successful login
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    }

    setLoading(false);
  };

  return (


    <>


      <div className="container">
        {/* Outer Row */}
        <div className="row justify-content-center">


          {/* Nested Row within Card Body */}


          <div className="col-lg-6">

            <div className="card o-hidden border-0 shadow-lg my-5">
              <div className="card-body p-0">
                <div className="p-5">
                  <div className="text-center">
                    <h1 className="h4 text-gray-900 mb-4">Welcome Back!</h1>
                  </div>
                  <form className="user">
                    <div className="form-group">
                      <input
                        type="email"
                        className="form-control form-control-user"
                        id="email"
                        aria-describedby="emailHelp"
                        placeholder="Enter Email Address..."
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="password"
                        className="form-control form-control-user"
                        id="password"
                        placeholder="Password"
                      />
                    </div>
                    <div className="form-group">
                      <div className="custom-control custom-checkbox small">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          id="customCheck"
                        />
                        <label className="custom-control-label" htmlFor="customCheck">
                          Remember Me
                        </label>
                      </div>
                    </div>
                    <button className="btn btn-primary btn-user btn-block" type="submit">
                      Login
                    </button>
                    <hr />
                    <button className="btn btn-google btn-user btn-block" type="button">
                      <i className="fab fa-google fa-fw"></i> Login with Google
                    </button>
                    <button className="btn btn-facebook btn-user btn-block" type="button">
                      <i className="fab fa-facebook-f fa-fw"></i> Login with Facebook
                    </button>
                  </form>
                  <hr />
                  <div className="text-center">
                    <a className="small" href="/forgot-password">
                      Forgot Password?
                    </a>
                  </div>
                  <div className="text-center">
                    <a className="small" href="/register">
                      Create an Account!
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>


        </div>
      </div>




      <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '1rem' }}>
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}

              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}

              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ padding: '0.5rem 1rem' }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>


    </>
  );
};

export default Login;
