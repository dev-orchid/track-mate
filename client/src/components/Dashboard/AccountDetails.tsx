// src/components/Dashboard/AccountDetails.tsx
import React, { useState, useEffect, FormEvent } from "react";
import useAccountUpdate from "../../hooks/useAccountUpdate";

export default function ProfileDetails({ account }) {
  const {
    updateAccount,
    loading: updating,
    error: updateError,
  } = useAccountUpdate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company_name: "",
  });

  useEffect(() => {
    if (account) {
      setForm({
        firstName: account.firstName,
        lastName: account.lastName,
        email: account.email,
        company_name: account.company_name,
      });
    }
  }, [account]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await updateAccount(form);
      // Optionally show a toast or reload user data
    } catch {
      // Error already handled in hook
    }
  }

  if (!account) return <p>No account data available.</p>;

  const { company_id } = account;

  return (
    <div id="content-wrapper" className="d-flex flex-column w-100">
      <div id="content">
        <div className="container-fluid">
          <button className="btn btn-link mb-4">Settings</button>

          <div className="row">
            {/* Sidebar Card */}
            <div className="col-lg-4">
              <div className="card">
                <div className="card-header">
                  <h6 className="m-0 font-weight-bold text-primary">
                   Company Details
                  </h6>
                </div>
                <div className="card-body">
                  <p>
                    <strong>Company Name:</strong> {form.company_name}
                  </p>
                  <p>
                    <strong>Public Api Key:</strong> {company_id}
                  </p>
                </div>
              </div>
            </div>

            {/* Editable Form */}
            <div className="col-lg-8 mb-4">
              <form onSubmit={handleSubmit}>
                <div className="card mb-4">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6">
                        <strong>Informations</strong>
                      </div>
                      <div className="col-md-6 text-right">
                        <button
                          type="submit"
                          className="btn btn-info mb-4"
                          disabled={updating}
                        >
                          {updating ? "Saving…" : "Update"}
                        </button>
                      </div>
                    </div>

                    {updateError && (
                      <div className="alert alert-danger">{updateError}</div>
                    )}

                    <div className="row">
                      <div className="col-md-6">
                        <label>First Name</label>
                        <input
                          type="text"
                          name="firstName"
                          className="form-control"
                          value={form.firstName}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label>Last Name</label>
                        <input
                          type="text"
                          name="lastName"
                          className="form-control"
                          value={form.lastName}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-md-6 my-3">
                        <label>Email</label>
                        <input
                          type="email"
                          name="email"
                          className="form-control"
                          value={form.email}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-md-6 my-3">
                        <label>Company</label>
                        <input
                          type="text"
                          name="company_name"
                          className="form-control"
                          value={form.company_name}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
