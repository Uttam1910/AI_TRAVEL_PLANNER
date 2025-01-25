// src/components/ui/CardContent.jsx
import React from "react";
import "./styles.css"; // inside each component where it's needed

const CardContent = ({ children }) => {
  return <div className="card-content">{children}</div>;
};

export default CardContent;
