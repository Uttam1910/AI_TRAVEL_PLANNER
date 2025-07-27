// src/components/ui/Input.jsx
import React from "react";
import "./styles.css"; // inside each component where it's needed

const Input = ({ label, value, onChange }) => {
  return (
    <div className="input-container">
      <label>{label}</label>
      <input value={value} onChange={onChange} />
    </div>
  );
};

export default Input;

