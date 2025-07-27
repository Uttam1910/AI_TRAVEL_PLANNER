// src/components/ui/Card.jsx
import React from "react";
import "./styles.css"; // inside each component where it's needed

const Card = ({ children }) => {
  return <div className="card">{children}</div>;
};

export default Card;
