import React, { useState } from 'react';
import Header from '../components/Layout/Header';
import Sidebar from '../components/Layout/Sidebar';
import Footer from '../components/Layout/Footer';
import type { NextPage } from 'next';
import { useLists, createList, updateList, deleteList, addTagsToList, removeTagsFromList, refreshListCount } from '../hooks/useLists';
import { useTags } from '../hooks/useTags';

const Lists: NextPage = () => {
  const { lists, loading, error, refetch } = useLists(100);
  const { tags } = useTags(100);
  const [showModal, setShowModal] = useState(false);
  const [showSnippetModal, setShowSnippetModal] = useState(false);
  const [selectedList, setSelectedList] = useState<any>(null);
  const [editingList, setEditingList] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tags: [] as string[],
    tag_logic: 'any' as 'any' | 'all'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingList) {
        await updateList(editingList._id, {
          name: formData.name,
          description: formData.description,
          tag_logic: formData.tag_logic
        });
        // Update tags separately
        const currentTagIds = editingList.tags.map((t: any) => t._id || t);
        const tagsToAdd = formData.tags.filter(t => !currentTagIds.includes(t));
        const tagsToRemove = currentTagIds.filter((t: string) => !formData.tags.includes(t));

        if (tagsToAdd.length > 0) {
          await addTagsToList(editingList._id, tagsToAdd);
        }
        for (const tagId of tagsToRemove) {
          await removeTagsFromList(editingList._id, tagId);
        }
      } else {
        await createList(formData);
      }
      refetch();
      handleCloseModal();
    } catch (err: any) {
      alert(err.response?.data?.message || 'An error occurred');
    }
  };

  const handleEdit = (list: any) => {
    setEditingList(list);
    setFormData({
      name: list.name,
      description: list.description || '',
      tags: list.tags.map((t: any) => t._id || t),
      tag_logic: list.tag_logic
    });
    setShowModal(true);
  };

  const handleDelete = async (listId: string) => {
    if (confirm('Are you sure you want to delete this list?')) {
      try {
        await deleteList(listId);
        refetch();
      } catch (err: any) {
        alert(err.response?.data?.message || 'An error occurred');
      }
    }
  };

  const handleRefreshCount = async (listId: string) => {
    try {
      await refreshListCount(listId);
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.message || 'An error occurred');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingList(null);
    setFormData({ name: '', description: '', tags: [], tag_logic: 'any' });
  };

  const toggleTag = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter(t => t !== tagId)
        : [...prev.tags, tagId]
    }));
  };

  const handleViewSnippet = (list: any) => {
    setSelectedList(list);
    setShowSnippetModal(true);
  };

  const copySnippet = () => {
    if (!selectedList) return;

    const snippet = `<!-- TrackMate Tracking Snippet for List: ${selectedList.name} -->
<script src="https://yourdomain.com/trackmate.js"></script>
<script>
  // Initialize TrackMate with your company ID and list ID
  TrackMate.init('YOUR_COMPANY_ID', 'YOUR_API_URL', {
    listId: '${selectedList.list_id}'
  });

  // Example: Identify user when they submit a form
  document.getElementById('signup-form').addEventListener('submit', function(e) {
    e.preventDefault();

    TrackMate.identify({
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value
    });
  });
</script>`;

    navigator.clipboard.writeText(snippet);
    alert('Snippet copied to clipboard!');
  };

  return (
    <div className="dashboard">
      <aside className="dashboard-sidebar">
        <Sidebar />
      </aside>
      <div className="dashboard-main">
        <header className="dashboard-header">
          <Header />
        </header>
        <section className="dashboard-content">
          <div className="webhook-logs-page">
            {/* Page Header */}
            <div className="page-header">
              <div>
                <h1 className="page-title">Lists</h1>
                <p className="page-subtitle">Create tag-based lists for email campaigns</p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={refetch} className="btn-refresh">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 4V10H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M23 20V14H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M20.49 9C19.9828 7.56678 19.1209 6.28542 17.9845 5.27542C16.8482 4.26541 15.4745 3.55976 13.9917 3.22426C12.5089 2.88875 10.9652 2.93434 9.50481 3.35677C8.04437 3.77921 6.71475 4.56471 5.64 5.64L1 10M23 14L18.36 18.36C17.2853 19.4353 15.9556 20.2208 14.4952 20.6432C13.0348 21.0657 11.4911 21.1112 10.0083 20.7757C8.52547 20.4402 7.1518 19.7346 6.01547 18.7246C4.87913 17.7146 4.01717 16.4332 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Refresh
                </button>
                <button onClick={() => setShowModal(true)} className="btn-refresh" style={{ background: '#4e73df', color: 'white' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Create List
                </button>
              </div>
            </div>

            {/* Lists Table */}
            <div className="logs-card">
              {loading && (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading lists...</p>
                </div>
              )}

              {error && (
                <div className="error-state">
                  <p>Error: {error}</p>
                </div>
              )}

              {!loading && !error && lists.length === 0 && (
                <div className="empty-state">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 6H21M8 12H21M8 18H21M3 6H3.01M3 12H3.01M3 18H3.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p>No lists found</p>
                  <span>Create your first list to get started</span>
                </div>
              )}

              {!loading && !error && lists.length > 0 && (
                <div className="logs-table-wrapper">
                  <table className="logs-table">
                    <thead>
                      <tr>
                        <th>List ID</th>
                        <th>Name</th>
                        <th>Tags</th>
                        <th>Logic</th>
                        <th>Profiles</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lists.map((list) => (
                        <tr key={list._id}>
                          <td>
                            <code style={{
                              background: '#f8f9fa',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '13px',
                              fontWeight: 600,
                              color: '#4e73df'
                            }}>
                              {list.list_id}
                            </code>
                          </td>
                          <td>
                            <div>
                              <div style={{ fontWeight: 600, marginBottom: '4px' }}>{list.name}</div>
                              {list.description && (
                                <div style={{ fontSize: '13px', color: '#6c757d' }}>{list.description}</div>
                              )}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', maxWidth: '300px' }}>
                              {list.tags && list.tags.length > 0 ? (
                                list.tags.map((tag: any) => (
                                  <span
                                    key={tag._id}
                                    style={{
                                      background: tag.color || '#6c757d',
                                      color: 'white',
                                      padding: '2px 8px',
                                      borderRadius: '12px',
                                      fontSize: '12px',
                                      fontWeight: 500
                                    }}
                                  >
                                    {tag.name}
                                  </span>
                                ))
                              ) : (
                                <span style={{ color: '#6c757d', fontSize: '13px' }}>No tags</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className={`method-badge ${list.tag_logic === 'all' ? 'method-post' : 'method-get'}`}>
                              {list.tag_logic.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: 600 }}>{list.profile_count || 0}</span>
                              <button
                                onClick={() => handleRefreshCount(list._id)}
                                className="tag-action-btn"
                                title="Refresh count"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M1 4V10H7M23 20V14H17M20.49 9C19.9828 7.56678 19.1209 6.28542 17.9845 5.27542C16.8482 4.26541 15.4745 3.55976 13.9917 3.22426C12.5089 2.88875 10.9652 2.93434 9.50481 3.35677C8.04437 3.77921 6.71475 4.56471 5.64 5.64L1 10M23 14L18.36 18.36C17.2853 19.4353 15.9556 20.2208 14.4952 20.6432C13.0348 21.0657 11.4911 21.1112 10.0083 20.7757C8.52547 20.4402 7.1518 19.7346 6.01547 18.7246C4.87913 17.7146 4.01717 16.4332 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                            </div>
                          </td>
                          <td>
                            <span className={`status-badge ${list.status === 'active' ? 'status-success' : 'status-info'}`}>
                              {list.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button onClick={() => handleViewSnippet(list)} className="tag-action-btn" title="View Tracking Snippet" style={{ background: '#1cc88a', color: 'white' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M16 18L22 12L16 6M8 6L2 12L8 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                              <button onClick={() => handleEdit(list)} className="tag-action-btn" title="Edit">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.43741 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                              <button onClick={() => handleDelete(list._id)} className="tag-action-btn tag-action-delete" title="Delete">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          <Footer />
        </section>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingList ? 'Edit List' : 'Create New List'}</h2>
              <button onClick={handleCloseModal} className="modal-close">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>List Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="filter-input"
                    placeholder="e.g., VIP Customers"
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="filter-input"
                    rows={2}
                    placeholder="Optional description for this list"
                  />
                </div>
                <div className="form-group">
                  <label>Tag Logic</label>
                  <select
                    value={formData.tag_logic}
                    onChange={(e) => setFormData({ ...formData, tag_logic: e.target.value as 'any' | 'all' })}
                    className="filter-select"
                  >
                    <option value="any">ANY (profile has at least one tag)</option>
                    <option value="all">ALL (profile has all tags)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Select Tags</label>
                  {tags.length === 0 ? (
                    <p style={{ fontSize: '13px', color: '#6c757d', margin: '8px 0' }}>
                      No tags available. Create tags first.
                    </p>
                  ) : (
                    <div className="tag-checkbox-list">
                      {tags.map((tag) => (
                        <label key={tag._id} className="tag-checkbox-item">
                          <input
                            type="checkbox"
                            checked={formData.tags.includes(tag._id)}
                            onChange={() => toggleTag(tag._id)}
                          />
                          <span
                            className="tag-checkbox-color"
                            style={{ backgroundColor: tag.color }}
                          />
                          <span className="tag-checkbox-label">{tag.name}</span>
                          <span className="tag-checkbox-count">({tag.profile_count || 0})</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={handleCloseModal} className="btn-pagination">
                  Cancel
                </button>
                <button type="submit" className="btn-refresh" style={{ background: '#4e73df', color: 'white' }}>
                  {editingList ? 'Update List' : 'Create List'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Snippet Modal */}
      {showSnippetModal && selectedList && (
        <div className="modal-overlay" onClick={() => setShowSnippetModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h2>Tracking Snippet for "{selectedList.name}"</h2>
              <button onClick={() => setShowSnippetModal(false)} className="modal-close">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '14px', color: '#5a5c69', marginBottom: '12px' }}>
                  Use this tracking snippet on your website to automatically assign the following tags to new profiles:
                </p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  {selectedList.tags && selectedList.tags.map((tag: any) => (
                    <span
                      key={tag._id}
                      style={{
                        background: tag.color || '#6c757d',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: 500
                      }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
                <div style={{
                  background: '#f8f9fa',
                  border: '1px solid #d1d3e2',
                  borderRadius: '6px',
                  padding: '12px',
                  marginBottom: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '13px', color: '#5a5c69' }}>List ID:</strong>
                    <code style={{
                      background: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#4e73df'
                    }}>
                      {selectedList.list_id}
                    </code>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#5a5c69', marginBottom: '8px', display: 'block' }}>
                  Embed this code in your website:
                </label>
                <pre style={{
                  background: '#2d2d2d',
                  color: '#f8f8f2',
                  padding: '16px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  lineHeight: '1.6',
                  overflow: 'auto',
                  maxHeight: '300px',
                  fontFamily: 'Courier New, monospace'
                }}>
{`<!-- TrackMate Tracking Snippet for List: ${selectedList.name} -->
<script src="https://yourdomain.com/trackmate.js"></script>
<script>
  // Initialize TrackMate with list ID
  TrackMate.init('YOUR_COMPANY_ID', 'YOUR_API_URL', {
    listId: '${selectedList.list_id}'
  });

  // Example: Track user signup
  document.getElementById('signup-form').addEventListener('submit', function(e) {
    e.preventDefault();

    TrackMate.identify({
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value
    });

    // Profile will be auto-assigned tags: ${selectedList.tags?.map((t: any) => t.name).join(', ')}
  });
</script>`}
                </pre>
              </div>

              <div style={{
                background: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, marginTop: '2px' }}>
                    <circle cx="12" cy="12" r="10" stroke="#856404" strokeWidth="2"/>
                    <path d="M12 16V12M12 8H12.01" stroke="#856404" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <div style={{ fontSize: '13px', color: '#856404' }}>
                    <strong>Note:</strong> Replace <code>YOUR_COMPANY_ID</code> and <code>YOUR_API_URL</code> with your actual TrackMate credentials. When users submit the form, they'll automatically be assigned all tags from this list.
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" onClick={() => setShowSnippetModal(false)} className="btn-pagination">
                Close
              </button>
              <button onClick={copySnippet} className="btn-refresh" style={{ background: '#1cc88a', color: 'white' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '6px' }}>
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5 15H4C3.46957 15 2.96086 14.7893 2.58579 14.4142C2.21071 14.0391 2 13.5304 2 13V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H13C13.5304 2 14.0391 2.21071 14.4142 2.58579C14.7893 2.96086 15 3.46957 15 4V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Copy Snippet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lists;
