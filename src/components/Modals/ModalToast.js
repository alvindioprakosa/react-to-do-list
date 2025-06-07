import React, { useCallback } from "react";
import PropTypes from 'prop-types';
import { Modal } from "react-bootstrap";
import classNames from "classnames";

function ModalToast({ show, handleClose, text, type }) {
  const onClose = useCallback(() => {
    handleClose();
  }, [handleClose]);

  const iconClass = useCallback(() => {
    return classNames({
      "icon-alert-sm": type === "success",
      "icon-danger-sm": type !== "success",
    });
  }, [type]);

  return (
    <Modal
      show={show}
      onHide={onClose}
      size="md"
      centered
      data-cy="modal-information"
    >
      <Modal.Header 
        closeButton 
        onClick={onClose}
      />
      <Modal.Body
        onClick={onClose}
        data-cy="modal-information-body"
      >
        <div
          data-cy="modal-information-icon"
          className={iconClass()}
        />
        <p data-cy="modal-information-title">
          {text}
        </p>
      </Modal.Body>
    </Modal>
  );
}

ModalToast.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'danger']).isRequired
};

export default React.memo(ModalToast);