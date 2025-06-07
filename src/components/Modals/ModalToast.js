import React, { useCallback } from "react";
import { Modal } from "react-bootstrap";
import classNames from "classnames";

function ModalToast({ show, handleClose, text, type }) {
  const onClose = useCallback(() => {
    handleClose();
  }, [handleClose]);

  return (
    <Modal
      show={show}
      onHide={onClose}
      size="md"
      centered
      data-cy="modal-information"
    >
      <Modal.Header closeButton onClick={onClose}></Modal.Header>
      <Modal.Body
        onClick={onClose}
        data-cy="modal-information-body"
      >
        <div
          data-cy="modal-information-icon"
          className={classNames({
            "icon-alert-sm": type === "success",
            "icon-danger-sm": type !== "success",
          })}
        />
        <p data-cy="modal-information-title">{text}</p>
      </Modal.Body>
    </Modal>
  );
}

export default ModalToast;
