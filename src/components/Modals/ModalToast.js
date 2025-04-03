import React from "react";
import { Modal } from "react-bootstrap";
import classNames from "classnames";

function ModalToast({ show, handleClose, text, type }) {
  return (
    <Modal
      show={show}
      onHide={handleClose}
      className="modal-toast"
      size="md"
      centered
      role="alertdialog"
    >
      <Modal.Body onClick={handleClose}>
        <div
          data-cy="modal-information-icon"
          className={classNames({
            "icon-alert-sm": type === "success",
            "icon-danger-sm": type !== "success",
          })}
        />
        <p data-cy="modal-information-title" className="px-3">{text}</p>
      </Modal.Body>
    </Modal>
  );
}

export default ModalToast;
