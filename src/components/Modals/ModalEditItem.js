import React, { useEffect, useState, useMemo } from "react";
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

  const options = useMemo(
    () => [
      { value: "very-high", label: "Very High" },
      { value: "high", label: "High" },
      { value: "normal", label: "Medium" },
      { value: "low", label: "Low" },
      { value: "very-low", label: "Very Low" },
    ],
    []
  );

  useEffect(() => {
    if (editedItem) {
      setItemName(editedItem.title);
      setPriority(editedItem.priority);
      setSelectState(options.find((option) => option.value === editedItem.priority));
    }
  }, [show, editedItem, options]);

  useEffect(() => {
    if (errUpdateItem !== null) {
      handleClose();
      dispatch(TodoActions.resetStateTodo());
    } else if (dataUpdateItem && show) {
      dispatch(TodoActions.getActivityDetailRequest(params));
      handleClose();
      dispatch(TodoActions.resetStateTodo());
    }
  }, [errUpdateItem, dataUpdateItem, show, params, dispatch, handleClose]);

  const formatOptionLabel = ({ value, label }) => (
    <div className="d-flex align-items-center">
      <div className={`label-indicator ${value}`}></div>
      <div>{label}</div>
    </div>
  );

  const submitAdd = () => {
    dispatch(TodoActions.updateItemRequest({
      data: { title: itemName, priority, is_active: editedItem.is_active },
      id: editedItem.id,
    }));
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      className="modal-add-activity"
      size="md"
      centered
      id="ModalUpdate"
    >
      <Modal.Header>
        <Modal.Title id="contained-modal-title-vcenter" className="pt-4">
          <h4 className="font-weight-bold">Edit Item</h4>
          <div className="icon-close" onClick={handleClose}></div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group>
          <label>NAMA LIST ITEM</label>
          <Form.Control
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Tambahkan nama Activity"
            value={itemName}
          />
          <label>PRIORITY</label>
          <br />
          <Select
            formatOptionLabel={formatOptionLabel}
            options={options}
            className="select-priority"
            onChange={(e) => {
              setSelectState(e);
              setPriority(e.value);
            }}
            value={selectState}
            id="UpdateFormPriority"
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer className="pb-4">
        <button
          className="btn btn-primary"
          onClick={submitAdd}
          disabled={!itemName}
          id="UpdateFormSubmit"
          aria-live="polite"
        >
          {isLoadingUpdateItem ? <Spinner animation="border" size="sm" /> : "Simpan"}
        </button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalEditItem;
