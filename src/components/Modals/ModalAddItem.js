import React, { useEffect, useState, useCallback, useMemo } from "react";
import PropTypes from 'prop-types';
import { Form, Modal, Spinner } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router";
import Select from "react-select";
import { Creators as TodoActions } from "../../redux/TodoRedux";

const PRIORITY_OPTIONS = [
  { value: "very-high", label: "Very High" },
  { value: "high", label: "High" },
  { value: "normal", label: "Medium" },
  { value: "low", label: "Low" },
  { value: "very-low", label: "Very Low" },
];

const CustomDropdownIndicator = () => (
  <div className="icon-dropdown mr-2" data-cy="modal-add-priority-dropdown" />
);

function ModalAddItem({ show, handleClose }) {
  const { todoId } = useParams();
  const dispatch = useDispatch();

  const { isLoadingAddItem, errAddItem, dataAddItem } = useSelector((state) => state.todo);

  const [itemName, setItemName] = useState("");
  const [priority, setPriority] = useState(PRIORITY_OPTIONS[0].value);

  const addItem = useCallback(
    (data) => dispatch(TodoActions.addItemRequest(data)),
    [dispatch]
  );

  const resetState = useCallback(
    () => dispatch(TodoActions.resetStateTodo()),
    [dispatch]
  );

  useEffect(() => {
    if (errAddItem !== null || dataAddItem) {
      handleClose();
      resetState();
    }
  }, [errAddItem, dataAddItem, handleClose, resetState]);

  const handleSubmit = useCallback(() => {
    addItem({ 
      title: itemName, 
      activity_group_id: todoId, 
      priority 
    });
  }, [addItem, itemName, todoId, priority]);

  const handleNameChange = useCallback((e) => {
    setItemName(e.target.value);
  }, []);

  const handlePriorityChange = useCallback((option) => {
    setPriority(option.value);
  }, []);

  const isSubmitDisabled = useMemo(() => !itemName, [itemName]);

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
          <h4 className="font-weight-bold" data-cy="modal-add-title">
            Tambah List Item
          </h4>
          <div 
            className="icon-close" 
            onClick={handleClose} 
            data-cy="modal-add-close-button"
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && handleClose()}
          />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group>
          <label data-cy="modal-add-name-title">NAMA LIST ITEM</label>
          <Form.Control
            onChange={handleNameChange}
            placeholder="Tambahkan nama Activity"
            id="AddFormTitle"
            data-cy="modal-add-name-input"
            value={itemName}
          />
          <label data-cy="modal-add-priority-title">PRIORITY</label>
          <Select
            defaultValue={PRIORITY_OPTIONS[0]}
            options={PRIORITY_OPTIONS}
            className="select-priority"
            onChange={handlePriorityChange}
            id="AddFormPriority"
            components={{
              DropdownIndicator: CustomDropdownIndicator,
            }}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer className="pb-4">
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          id="AddFormSubmit"
          data-cy="modal-add-save-button"
          aria-live="polite"
        >
          {isLoadingAddItem ? (
            <Spinner animation="border" size="sm" />
          ) : (
            "Simpan"
          )}
        </button>
      </Modal.Footer>
    </Modal>
  );
}

ModalAddItem.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
};

export default React.memo(ModalAddItem);