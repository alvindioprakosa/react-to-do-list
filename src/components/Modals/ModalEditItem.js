import React, { useEffect, useState, useMemo, useCallback } from "react";
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
  <div className="icon-dropdown mr-2" data-cy="modal-edit-priority-dropdown" />
);

function ModalEditItem({ show, handleClose, editedItem }) {
  const { todoId } = useParams();
  const dispatch = useDispatch();

  const { isLoadingUpdateItem, errUpdateItem, dataUpdateItem } = useSelector(
    (state) => state.todo
  );

  const [itemName, setItemName] = useState("");
  const [priority, setPriority] = useState("very-high");
  const [selectState, setSelectState] = useState({});

  const resetState = useCallback(
    () => dispatch(TodoActions.resetStateTodo()),
    [dispatch]
  );

  const getActivityDetail = useCallback(
    () => dispatch(TodoActions.getActivityDetailRequest(todoId)),
    [dispatch, todoId]
  );

  useEffect(() => {
    if (editedItem) {
      setItemName(editedItem.title);
      setPriority(editedItem.priority);
      setSelectState(PRIORITY_OPTIONS.find((option) => option.value === editedItem.priority));
    }
  }, [show, editedItem]);

  useEffect(() => {
    if (errUpdateItem !== null || dataUpdateItem) {
      if (dataUpdateItem) {
        getActivityDetail();
      }
      handleClose();
      resetState();
    }
  }, [errUpdateItem, dataUpdateItem, handleClose, getActivityDetail, resetState]);

  const handleSubmit = useCallback(() => {
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
  }, [dispatch, itemName, priority, editedItem]);

  const handleNameChange = useCallback((e) => {
    setItemName(e.target.value);
  }, []);

  const handlePriorityChange = useCallback((option) => {
    setSelectState(option);
    setPriority(option.value);
  }, []);

  const isSubmitDisabled = useMemo(() => !itemName, [itemName]);

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
          <h4 className="font-weight-bold" data-cy="modal-edit-title">
            Edit Item
          </h4>
          <div 
            className="icon-close" 
            onClick={handleClose} 
            data-cy="modal-edit-close-button"
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && handleClose()}
          />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group>
          <label data-cy="modal-edit-name-title">NAMA LIST ITEM</label>
          <Form.Control
            onChange={handleNameChange}
            placeholder="Tambahkan nama Activity"
            value={itemName}
            data-cy="modal-edit-name-input"
          />
          <label data-cy="modal-edit-priority-title">PRIORITY</label>
          <Select
            options={PRIORITY_OPTIONS}
            className="select-priority"
            onChange={handlePriorityChange}
            value={selectState}
            id="UpdateFormPriority"
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
          id="UpdateFormSubmit"
          data-cy="modal-edit-save-button"
          aria-live="polite"
        >
          {isLoadingUpdateItem ? (
            <Spinner animation="border" size="sm" />
          ) : (
            "Simpan"
          )}
        </button>
      </Modal.Footer>
    </Modal>
  );
}

ModalEditItem.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  editedItem: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    priority: PropTypes.string.isRequired,
    is_active: PropTypes.number.isRequired,
  }),
};

export default React.memo(ModalEditItem);