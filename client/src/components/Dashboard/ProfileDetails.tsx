// src/components/Dashboard/ProfileDetails.tsx

import React from "react";
import { useRouter } from "next/router";
import useProfileDetails from "../../hooks/useProfileDetails";

export default function ProfileDetails() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const { profile, loading, error } = useProfileDetails(id);

  if (!id || loading) {
    return (
      <div className="text-center py-5">
        <p>Loading profile…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-5 text-danger">
        <p>Error loading profile: {error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-5 text-muted">
        <p>Profile not found</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <button
        className="btn btn-link mb-4"
        onClick={() => router.back()}
      >
        ← Back
      </button>

      {/* Profile Info */}
      <div className="card mb-4">
        <div className="card-header">Profile Details</div>
        <div className="card-body">
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Phone:</strong> {profile.phone}</p>
          <p>
            <strong>Last Active:</strong>{" "}
            {new Date(profile.lastActive).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Session Events */}
      <div className="card">
        <div className="card-header">Session Events</div>
        <div className="card-body">
          {profile.events.length === 0 && (
            <p className="text-muted">No sessions or events.</p>
          )}

          {profile.events.map((session) => (
            <div key={session.sessionId} className="mb-4">
              <h5>
                Session ID: <code>{session.sessionId}</code>
              </h5>

              <div className="table-responsive">
                <table className="table table-bordered mb-0">
                  <thead className="thead-light">
                    <tr>
                      <th>#</th>
                      <th>Event Type</th>
                      <th>When</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {session.events.map((ev, idx) => (
                      <tr key={ev._id}>
                        <td>{idx + 1}</td>
                        <td>{ev.eventType}</td>
                        <td>
                          {new Date(ev.timestamp).toLocaleString()}
                        </td>
                        <td>
                          {ev.eventData.address && (
                            <p>
                              <strong>Address:</strong>{" "}
                              {ev.eventData.address}
                            </p>
                          )}
                          {ev.eventData.productInfos?.length > 0 && (
                            <>
                              <strong>Products:</strong>
                              <ul className="mb-0">
                                {ev.eventData.productInfos.map((prod) => (
                                  <li key={prod._id}>
                                    {prod.productName} — $
                                    {prod.price.toFixed(2)}
                                  </li>
                                ))}
                              </ul>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}