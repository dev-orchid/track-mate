import React, { useState } from 'react';
import Header from '../components/Layout/Header';
import Sidebar from '../components/Layout/Sidebar';
import Footer from '../components/Layout/Footer';
import type { NextPage } from 'next';
import { useTags, createTag, updateTag, deleteTag } from '../hooks/useTags';

const Tags: NextPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { tags, loading, error, refetch } = useTags(100, 0, searchTerm);
  const [showModal, setShowModal] = useState(false);
  const [editingTag, setEditingTag] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#4A90E2'
  });

  const colorOptions = [
    { value: '#4A90E2', label: 'Blue' },
    { value: '#50C878', label: 'Green' },
    { value: '#FF6B6B', label: 'Red' },
    { value: '#FFA500', label: 'Orange' },
    { value: '#9B59B6', label: 'Purple' },
    { value: '#F1C40F', label: 'Yellow' },
    { value: '#1ABC9C', label: 'Teal' },
    { value: '#E91E63', label: 'Pink' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTag) {
        await updateTag(editingTag._id, formData);
      } else {
        await createTag(formData);
      }
      refetch();
      handleCloseModal();
    } catch (err: any) {
      alert(err.response?.data?.message || 'An error occurred');
    }
  };

  const handleEdit = (tag: any) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      description: tag.description || '',
      color: tag.color
    });
    setShowModal(true);
  };

  const handleDelete = async (tagId: string) => {
    if (confirm('Are you sure you want to delete this tag?')) {
      try {
        await deleteTag(tagId);
        refetch();
      } catch (err: any) {
        alert(err.response?.data?.message || 'An error occurred');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTag(null);
    setFormData({ name: '', description: '', color: '#4A90E2' });
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
                <h1 className="page-title">Tags</h1>
                <p className="page-subtitle">Organize and categorize your profiles</p>
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
                  Create Tag
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="filters-card">
              <div className="filters-row">
                <div className="filter-group" style={{ flex: 1 }}>
                  <label>Search Tags</label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by tag name..."
                    className="filter-input"
                  />
                </div>
              </div>
            </div>

            {/* Tags Grid */}
            <div className="logs-card">
              {loading && (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading tags...</p>
                </div>
              )}

              {error && (
                <div className="error-state">
                  <p>Error: {error}</p>
                </div>
              )}

              {!loading && !error && tags.length === 0 && (
                <div className="empty-state">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.59 13.41L13.42 20.58C13.2343 20.766 13.0137 20.9135 12.7709 21.0141C12.5281 21.1148 12.2678 21.1666 12.005 21.1666C11.7422 21.1666 11.4819 21.1148 11.2391 21.0141C10.9963 20.9135 10.7757 20.766 10.59 20.58L2 12V2H12L20.59 10.59C20.9625 10.9647 21.1716 11.4716 21.1716 12C21.1716 12.5284 20.9625 13.0353 20.59 13.41Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 7H7.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p>No tags found</p>
                  <span>Create your first tag to get started</span>
                </div>
              )}

              {!loading && !error && tags.length > 0 && (
                <div className="tags-grid">
                  {tags.map((tag) => (
                    <div key={tag._id} className="tag-card">
                      <div className="tag-card-header">
                        <div className="tag-color-badge" style={{ backgroundColor: tag.color }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20.59 13.41L13.42 20.58C13.2343 20.766 13.0137 20.9135 12.7709 21.0141C12.5281 21.1148 12.2678 21.1666 12.005 21.1666C11.7422 21.1666 11.4819 21.1148 11.2391 21.0141C10.9963 20.9135 10.7757 20.766 10.59 20.58L2 12V2H12L20.59 10.59C20.9625 10.9647 21.1716 11.4716 21.1716 12C21.1716 12.5284 20.9625 13.0353 20.59 13.41Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M7 7H7.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div className="tag-card-actions">
                          <button onClick={() => handleEdit(tag)} className="tag-action-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.43741 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          <button onClick={() => handleDelete(tag._id)} className="tag-action-btn tag-action-delete">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="tag-card-body">
                        <h3 className="tag-card-title">{tag.name}</h3>
                        {tag.description && <p className="tag-card-description">{tag.description}</p>}
                        <div className="tag-card-footer">
                          <span className="tag-profile-count">{tag.profile_count || 0} profiles</span>
                        </div>
                      </div>
                    </div>
                  ))}
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
              <h2>{editingTag ? 'Edit Tag' : 'Create New Tag'}</h2>
              <button onClick={handleCloseModal} className="modal-close">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Tag Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="filter-input"
                    placeholder="e.g., VIP Customer"
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="filter-input"
                    rows={3}
                    placeholder="Optional description for this tag"
                  />
                </div>
                <div className="form-group">
                  <label>Color</label>
                  <div className="color-picker-grid">
                    {colorOptions.map((color) => (
                      <div
                        key={color.value}
                        className={`color-option ${formData.color === color.value ? 'selected' : ''}`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => setFormData({ ...formData, color: color.value })}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={handleCloseModal} className="btn-pagination">
                  Cancel
                </button>
                <button type="submit" className="btn-refresh" style={{ background: '#4e73df', color: 'white' }}>
                  {editingTag ? 'Update Tag' : 'Create Tag'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tags;
