import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EnquiryPage = ({ propertyId }) => {
  const [formData, setFormData] = useState({
    message: '',
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (!propertyId) {
      toast.error("Property ID missing. Cannot submit enquiry.");
      return;
    }
    try {
      const res = await fetch(`${process.env.REACT_APP_CREATE_ENQUIRY_API}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          propertyId,
          message: formData.message,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Enquiry submitted successfully!');
        setFormData({ message: '' });
        setErrors({});
      } else {
        toast.error(data.message || 'Failed to submit enquiry');
      }
    } catch (error) {
      console.error('Error sending enquiry:', error);
      toast.error('Server error. Please try again later.');
    }
  };

  return (
    <>
      <ToastContainer />
      <div style={styles.pageContainer}>
        <h1 style={styles.header}>Contact & Enquiry</h1>
        <div style={styles.card} className="fade-in">
          <form onSubmit={handleSubmit} noValidate>
            <div style={styles.field}>
              <label htmlFor="message" style={styles.label}>Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={7}
                style={{ ...styles.textarea, borderColor: errors.message ? '#e74c3c' : '#ccc' }}
              />
              {errors.message && <span style={styles.error}>{errors.message}</span>}
            </div>

            <button type="submit" style={styles.button} className="hover-fade">
              Submit Enquiry
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .fade-in {
          animation: fadeInAnimation 0.8s ease forwards;
        }
        @keyframes fadeInAnimation {
          from { opacity: 0; transform: translateY(20px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .hover-fade {
          transition: background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
          cursor: pointer;
        }
        .hover-fade:hover {
          box-shadow: 0 8px 15px rgba(0, 180, 216, 0.4);
          transform: translateY(-2px);
        }
      `}</style>
    </>
  );
};

const styles = {
  pageContainer: {
    maxWidth: 500,
    margin: '40px auto',
    padding: '0 20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: '#333',
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    padding: 28,
    borderRadius: 8,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    maxWidth: 500,
    margin: '0 auto',
  },
  field: {
    marginBottom: 16,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
    fontSize: 14,
    alignSelf: 'flex-start',
  },
  textarea: {
    width: '100%',
    maxWidth: 480,
    height: 120,
    padding: '12px 14px',
    fontSize: 14,
    borderRadius: 8,
    border: '1px solid #ccc',
    outline: 'none',
    resize: 'vertical',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  error: {
    marginTop: 4,
    color: '#e74c3c',
    fontSize: 12,
  },
  button: {
    width: '100%',
    padding: '12px 0',
    background: 'linear-gradient(135deg, #007BFF, #00B4D8)',
    border: 'none',
    borderRadius: 8,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    boxShadow: 'none',
    transition: 'box-shadow 0.3s ease, transform 0.3s ease',
  },
};

export default EnquiryPage;
