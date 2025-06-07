import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Form, Modal, Spinner } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router";
import Select from "react-select";
import { Creators as TodoActions } from "../../redux/TodoRedux";

function ModalEditItem({ show, handleClose, editedItem }) {
  const params = useParams().todoId;
  const dispatch = useDispatch();

  const { isLoadingUpdateItem, errUpdateItem, dataUpdateItem } = useSelector(
    (state) => state.todo
  );

  const [itemName, setItemName] = useState("");
  const [priority, setPriority] = useState("very-high");
  const [selectState, setSelectState] = useState({});

  const options = useMemo(() => [
    { value: "very-high", label: "Very High" },
    { value: "high", label: "High" },
    { value: "normal", label: "Medium" },
    { value: "low", label: "Low" },
    { value: "very-low", label: "Very Low" },
  ], []);

  const resetState = useCallback(() => dispatch(TodoActions.resetStateTodo()), [dispatch]);

  useEffect(() => {
    if (editedItem) {
      setItemName(editedItem.title);
      setPriority(editedItem.priority);
      setSelectState(options.find((option) => option.value === editedItem.priority));
    }
  }, [show, editedItem, options]);

  useEffect(() => {
    if (errUpdateItem !== null || dataUpdateItem) {
      if (dataUpdateItem) {
        dispatch(TodoActions.getActivityDetailRequest(params));
      }
      handleClose();
      resetState();
    }
  }, [errUpdateItem, dataUpdateItem, handleClose, dispatch, params, resetState]);

  const submitEdit = () => {
    dispatch(
      TodoActions.updateItemRequest({
        data: {
          title: itemName,
          priority,
          is_active: editedItem?.is_active,
        },
        id: editedItem?.id,
      })
    );
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="md"
      centered
      id="ModalUpdate"
    >
      <Modal.Header>
        <Modal.Title className="pt-4">
          <h4 className="font-weight-bold" data-cy="modal-edit-title">Edit Item</h4>
          <div className="icon-close" onClick={handleClose} data-cy="modal-edit-close-button" />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group>
          <label data-cy="modal-edit-name-title">NAMA LIST ITEM</label>
          <Form.Control
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Tambahkan nama Activity"
            value={itemName}
            data-cy="modal-edit-name-input"
          />
          <label data-cy="modal-edit-priority-title">PRIORITY</label>
          <Select
            options={options}
            className="select-priority"
            onChange={(e) => {
              setSelectState(e);
              setPriority(e.value);
            }}
            value={selectState}
            id="UpdateFormPriority"
            components={{
              DropdownIndicator: () => (
                <div className="icon-dropdown mr-2" data-cy="modal-edit-priority-dropdown" />
              ),
            }}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer className="pb-4">
        <button
          className="btn btn-primary"
          onClick={submitEdit}
          disabled={!itemName}
          id="UpdateFormSubmit"
          data-cy="modal-edit-save-button"
          aria-live="polite"
        >
          {isLoadingUpdateItem ? <Spinner animation="border" size="sm" /> : "Simpan"}
        </button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalEditItem;
