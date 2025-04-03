import React, { useEffect } from "react";
import { Modal, Spinner } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import alertIcon from "../../assets/images/icon-alert.svg";
import { Creators as TodoActions } from "../../redux/TodoRedux";

function ModalDelete({ show, handleClose, title, text, deletedItem, handleDelete }) {
  const dispatch = useDispatch();

  const { 
    isLoadingDeleteActivity, dataDeleteActivity, errDeleteActivity,
    isLoadingDeleteItem, dataDeleteItem, errDeleteItem
  } = useSelector((state) => state.todo);

  useEffect(() => {
    if (errDeleteActivity !== null || dataDeleteActivity || errDeleteItem !== null || dataDeleteItem) {
      handleClose();
      dispatch(TodoActions.resetStateTodo());
    }
  }, [errDeleteActivity, dataDeleteActivity, errDeleteItem, dataDeleteItem, handleClose, dispatch]);

  const handleClickDelete = () => handleDelete ? handleDelete() : dispatch(TodoActions.deleteActivityRequest(deletedItem));

  return (
    <Modal
      show={show}
      onHide={handleClose}
      className="modal-delete"
      size="md"
      centered
      id="ModalDelete"
      data-cy="todo-modal-delete"
    >
      <Modal.Header>
        <Modal.Title className="pt-4">
          <img src={alertIcon} alt="alert" data-cy="modal-delete-icon" />
          <h4 className="font-weight-bold" data-cy="modal-delete-title">{title}</h4>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="px-3" dangerouslySetInnerHTML={{ __html: text }}></p>
      </Modal.Body>
      <Modal.Footer className="pb-4">
        <button className="btn btn-secondary" data-cy="modal-delete-cancel-button" onClick={handleClose}>
          Batal
        </button>
        <button 
          className="btn btn-danger" 
          data-cy="modal-delete-confirm-button" 
          onClick={handleClickDelete} 
          aria-live="polite"
        >
          {(isLoadingDeleteActivity || isLoadingDeleteItem) ? <Spinner animation="border" size="sm" /> : "Hapus"}
        </button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalDelete;
