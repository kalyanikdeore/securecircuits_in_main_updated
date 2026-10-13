import React from "react";

function Delete({ show, onConfirm, onCancel }) {
  return (
    <div className={`popup-backdrop ${show ? "show" : ""}`}>
      <div className={`popup-container ${show ? "drop" : ""}`}>
        <div className="popup-card">
          <h4 className="popup-title">⚠ CONFIRM DELETE</h4>
          <p className="popup-text">
            Are you sure you want to Delete this record?
          </p>

          <div className="popup-btn-group">
            <button className="popup-btn-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button className="popup-btn-delete" onClick={onConfirm}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Delete;
