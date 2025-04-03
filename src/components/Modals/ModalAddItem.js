import React, { useEffect, useState, useCallback } from "react";
import { Form, Modal, Spinner } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router";
import Select from "react-select";
import { Creators as TodoActions } from "../../redux/TodoRedux";

const priorityOptions = [
  { value: "very-high", label: "Very High" },
  { value: "high", label: "High" },
  { value: "normal", label: "Medium" },
  { value: "low", label: "Low" },
  { value: "very-low", label: "Very Low" },
];

function ModalAddItem({ show, handleClose }) {
  const params = useParams().todoId;
  const dispatch = useDispatch();

  const { isLoadingAddItem, errAddItem, dataAddItem } = useSelector((state) => state.todo);

  const [itemName, setItemName] = useState("");
  const [priority, setPriority] = useState(priorityOptions[0].value);

  const addItem = useCallback(
    (data) => dispatch(TodoActions.addItemRequest(data)),
    [dispatch]
  );

  const resetState = useCallback(() => dispatch(TodoActions.resetStateTodo()), [dispatch]);

  useEffect(() => {
    if (errAddItem !== null || dataAddItem) {
      handleClose();
      resetState();
    }
  }, [errAddItem, dataAddItem, handleClose, resetState]);

  const submitAdd = () => {
    addItem({ title: itemName, activity_group_id: params, priority });
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      className="modal-add-activity"
      size="md"
      centered
    >
      <Modal.Header>
        <Modal.Title className="pt-4">
          <h4 className="font-weight-bold" data-cy="modal-add-title">Tambah List Item</h4>
          <div className="icon-close" onClick={handleClose} data-cy="modal-add-close-button"></div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group>
          <label data-cy="modal-add-name-title">NAMA LIST ITEM</label>
          <Form.Control
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Tambahkan nama Activity"
            id="AddFormTitle"
            data-cy="modal-add-name-input"
          />
          <label data-cy="modal-add-priority-title">PRIORITY</label>
          <Select
            defaultValue={priorityOptions[0]}
            options={priorityOptions}
            className="select-priority"
            onChange={(e) => setPriority(e.value)}
            id="AddFormPriority"
            components={{
              DropdownIndicator: () => <div className="icon-dropdown mr-2" data-cy="modal-add-priority-dropdown"></div>,
            }}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer className="pb-4">
        <button
          className="btn btn-primary"
          onClick={submitAdd}
          disabled={!itemName}
          id="AddFormSubmit"
          data-cy="modal-add-save-button"
          aria-live="polite"
        >
          {isLoadingAddItem ? <Spinner animation="border" size="sm" /> : "Simpan"}
        </button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalAddItem;
