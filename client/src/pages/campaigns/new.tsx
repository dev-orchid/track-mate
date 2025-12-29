import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../../components/Layout/Header';
import Sidebar from '../../components/Layout/Sidebar';
import Footer from '../../components/Layout/Footer';
import { createCampaign } from '../../hooks/useCampaigns';
import { useLists } from '../../hooks/useLists';
import type { NextPage } from 'next';

const NewCampaign: NextPage = () => {
  const router = useRouter();
  const { lists } = useLists(100);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    list_id: '',
    subject: '',
    preview_text: '',
    from_name: '',
    from_email: '',
    reply_to: '',
    html_content: '',
    text_content: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const result = await createCampaign(formData);
      alert('Campaign created successfully!');
      router.push(`/campaigns`);
    } catch (error: any) {
      alert(error.response?.data?.message || 'An error occurred');
      setSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const insertPlaceholder = (placeholder: string) => {
    const textarea = document.getElementById('html_content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.html_content;
      const newText = text.substring(0, start) + placeholder + text.substring(end);
      setFormData(prev => ({ ...prev, html_content: newText }));

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
      }, 0);
    }
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
                <h1 className="page-title">Create New Campaign</h1>
                <p className="page-subtitle">Design and send email campaigns to your lists</p>
              </div>
              <button
                onClick={() => router.push('/campaigns')}
                className="btn-refresh"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back to Campaigns
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Left Column */}
                <div>
                  <div className="logs-card" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', padding: '0 4px' }}>Campaign Details</h3>
                    <div className="form-group">
                      <label>Campaign Name *</label>
                      <input
                        type="text"
                        className="filter-input"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        required
                        placeholder="e.g., Monthly Newsletter - January 2025"
                      />
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        className="filter-input"
                        rows={2}
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder="Internal description for this campaign"
                      />
                    </div>

                    <div className="form-group">
                      <label>Select List *</label>
                      <select
                        className="filter-select"
                        value={formData.list_id}
                        onChange={(e) => handleChange('list_id', e.target.value)}
                        required
                      >
                        <option value="">Choose a list...</option>
                        {lists.map((list) => (
                          <option key={list._id} value={list._id}>
                            {list.list_id} - {list.name} ({list.profile_count} profiles)
                          </option>
                        ))}
                      </select>
                      {lists.length === 0 && (
                        <small style={{ color: '#dc3545', fontSize: '13px', marginTop: '4px', display: 'block' }}>
                          No lists available. Create a list first.
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="logs-card">
                    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', padding: '0 4px' }}>Email Content</h3>
                    <div className="form-group">
                      <label>Subject Line *</label>
                      <input
                        type="text"
                        className="filter-input"
                        value={formData.subject}
                        onChange={(e) => handleChange('subject', e.target.value)}
                        required
                        placeholder="Your email subject line"
                      />
                    </div>

                    <div className="form-group">
                      <label>Preview Text</label>
                      <input
                        type="text"
                        className="filter-input"
                        value={formData.preview_text}
                        onChange={(e) => handleChange('preview_text', e.target.value)}
                        placeholder="Text shown in email previews"
                      />
                      <small style={{ color: '#6c757d', fontSize: '13px', marginTop: '4px', display: 'block' }}>
                        This appears in the inbox preview
                      </small>
                    </div>

                    <div className="form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label style={{ marginBottom: 0 }}>HTML Content *</label>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            type="button"
                            className="tag-action-btn"
                            onClick={() => insertPlaceholder('{{name}}')}
                            title="Insert {{name}}"
                          >
                            {'{{name}}'}
                          </button>
                          <button
                            type="button"
                            className="tag-action-btn"
                            onClick={() => insertPlaceholder('{{email}}')}
                            title="Insert {{email}}"
                          >
                            {'{{email}}'}
                          </button>
                          <button
                            type="button"
                            className="tag-action-btn"
                            onClick={() => insertPlaceholder('{{phone}}')}
                            title="Insert {{phone}}"
                          >
                            {'{{phone}}'}
                          </button>
                        </div>
                      </div>
                      <textarea
                        id="html_content"
                        className="filter-input"
                        rows={12}
                        value={formData.html_content}
                        onChange={(e) => handleChange('html_content', e.target.value)}
                        required
                        placeholder="Enter your HTML email content here..."
                        style={{ fontFamily: 'monospace', fontSize: '13px' }}
                      />
                      <small style={{ color: '#6c757d', fontSize: '13px', marginTop: '4px', display: 'block' }}>
                        You can use placeholders: {'{{name}}'}, {'{{email}}'}, {'{{phone}}'}, {'{{first_name}}'}
                      </small>
                    </div>

                    <div className="form-group">
                      <label>Plain Text Version</label>
                      <textarea
                        className="filter-input"
                        rows={6}
                        value={formData.text_content}
                        onChange={(e) => handleChange('text_content', e.target.value)}
                        placeholder="Optional plain text version for email clients that don't support HTML"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  <div className="logs-card" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', padding: '0 4px' }}>Sender Information</h3>
                    <div className="form-group">
                      <label>From Name *</label>
                      <input
                        type="text"
                        className="filter-input"
                        value={formData.from_name}
                        onChange={(e) => handleChange('from_name', e.target.value)}
                        required
                        placeholder="Your Company Name"
                      />
                    </div>

                    <div className="form-group">
                      <label>From Email *</label>
                      <input
                        type="email"
                        className="filter-input"
                        value={formData.from_email}
                        onChange={(e) => handleChange('from_email', e.target.value)}
                        required
                        placeholder="noreply@yourcompany.com"
                      />
                    </div>

                    <div className="form-group">
                      <label>Reply-To Email</label>
                      <input
                        type="email"
                        className="filter-input"
                        value={formData.reply_to}
                        onChange={(e) => handleChange('reply_to', e.target.value)}
                        placeholder="support@yourcompany.com"
                      />
                      <small style={{ color: '#6c757d', fontSize: '13px', marginTop: '4px', display: 'block' }}>
                        Where replies should go
                      </small>
                    </div>
                  </div>

                  <div className="logs-card" style={{ marginBottom: '24px', background: '#f8f9fa' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', padding: '0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="#f39c12" strokeWidth="2"/>
                        <path d="M12 16V12M12 8H12.01" stroke="#f39c12" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      Tips
                    </h3>
                    <ul style={{ fontSize: '13px', color: '#6c757d', paddingLeft: '20px', margin: 0 }}>
                      <li style={{ marginBottom: '8px' }}>Use personalization to increase engagement</li>
                      <li style={{ marginBottom: '8px' }}>Keep subject lines under 50 characters</li>
                      <li style={{ marginBottom: '8px' }}>Test your emails before sending</li>
                      <li>Include an unsubscribe link</li>
                    </ul>
                  </div>

                  <div className="logs-card">
                    <button
                      type="submit"
                      className="btn-refresh"
                      disabled={submitting || !formData.list_id}
                      style={{
                        width: '100%',
                        background: '#4e73df',
                        color: 'white',
                        justifyContent: 'center',
                        marginBottom: '12px'
                      }}
                    >
                      {submitting ? (
                        <>
                          <div className="spinner" style={{ width: '16px', height: '16px', marginRight: '8px' }}></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 2.58579C3.96086 2.21071 4.46957 2 5 2H16L21 7V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M17 21V13H7V21M7 3V7H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Save as Draft
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn-pagination"
                      onClick={() => router.push('/campaigns')}
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <Footer />
        </section>
      </div>
    </div>
  );
};

export default NewCampaign;
