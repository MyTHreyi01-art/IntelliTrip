import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackButton = ({ to = '/', label = 'Back' }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate(to);
  };

  return (
    <button type="button" onClick={handleBack} className="btn btn-secondary" style={styles.button}>
      <ArrowLeft size={16} /> {label}
    </button>
  );
};

const styles = {
  button: {
    padding: '0.55rem 0.85rem',
    fontSize: '0.82rem',
    marginBottom: '1rem'
  }
};

export default BackButton;