import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Dropdown, Form, Spinner } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router";
import deleteIcon from "../../assets/images/icon-delete.svg";
import emptyItem from "../../assets/images/empty-item.png";
import { Creators as TodoActions } from "../../redux/TodoRedux";
import ModalAddItem from "../Modals/ModalAddItem";
import ModalToast from "../Modals/ModalToast";
import ModalDelete from "../Modals/ModalDelete";
import ModalEditItem from "../Modals/ModalEditItem";

function TodoDetailModule() {
  const params = useParams().todoId;
  const history = useHistory();
  const titleInput = useRef(null);

  const dispatch = useDispatch();
  const updateActivity = useCallback(
    (data) => dispatch(TodoActions.updateActivityRequest(data)),
    [dispatch]
  );
  const getActivityDetail = useCallback(
    (data) => dispatch(TodoActions.getActivityDetailRequest(data)),
    [dispatch]
  );
  const resetState = useCallback(() => dispatch(TodoActions.resetStateTodo()), [dispatch]);
  const updateItem = useCallback((data) => dispatch(TodoActions.updateItemRequest(data)), [dispatch]);
  const deleteItem = useCallback((data) => dispatch(TodoActions.deleteItemRequest(data)), [dispatch]);

  const { dataGetActivityDetail, isLoadingGetActivityDetail, dataAddItem, errAddItem, errUpdateItem, dataUpdateItem } =
    useSelector((state) => state.todo);

  const [isEditTitle, setIsEditTitle] = useState(false);
  const [titleState, setTitleState] = useState("");
  const [showAddItem, setShowAddItem] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState("success");
  const [modalText, setModalText] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [deletedItem, setDeletedItem] = useState(null);
  const [showEditItem, setShowEditItem] = useState(false);
  const [editedItem, setEditedItem] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(1);

  useEffect(() => {
    if (dataGetActivityDetail) {
      setTitleState(dataGetActivityDetail?.title);
    }
  }, [dataGetActivityDetail]);

  useEffect(() => {
    if (dataUpdateItem) resetState();
  }, [dataUpdateItem, resetState]);

  useEffect(() => {
    if (errAddItem) {
      setShowToast(true);
      setToastType("danger");
      setModalText(errAddItem || "Gagal menambahkan activity");
    }
    if (dataAddItem) {
      getActivityDetail(params);
      resetState();
    }
  }, [errAddItem, dataAddItem, getActivityDetail, params, resetState]);

  useEffect(() => {
    if (errUpdateItem) {
      setShowToast(true);
      setToastType("danger");
      setModalText(errUpdateItem || "Gagal mengedit activity");
    }
  }, [errUpdateItem]);

  // Gunakan useMemo untuk sorting agar tidak dihitung ulang setiap render
  const sortedItems = useMemo(() => {
    let items = dataGetActivityDetail?.todo_items || [];
    switch (activeDropdown) {
      case 2:
        return [...items].sort((a, b) => a.id - b.id); // Terlama
      case 3:
        return [...items].sort((a, b) => a.title.localeCompare(b.title)); // A-Z
      case 4:
        return [...items].sort((a, b) => b.title.localeCompare(a.title)); // Z-A
      case 5:
        return [...items].filter((item) => item.is_active === 1); // Belum Selesai
      default:
        return [...items].sort((a, b) => b.id - a.id); // Terbaru (default)
    }
  }, [dataGetActivityDetail?.todo_items, activeDropdown]);

  const handleEditTitle = () => {
    setIsEditTitle((prev) => !prev);
    if (isEditTitle) updateActivity({ id: params, data: { title: titleState } });
  };

  const handleCheckbox = (id) => {
    const updatedItems = sortedItems.map((item) =>
      item.id === id ? { ...item, is_active: item.is_active === 1 ? 0 : 1 } : item
    );
    const updatedItem = updatedItems.find((item) => item.id === id);
    updateItem({ id, data: { ...updatedItem } });
  };

  const handleDelete = () => {
    deleteItem(deletedItem);
  };

  return (
    <div className="container">
      {isLoadingGetActivityDetail ? (
        <div className="spinner-wrapper">
          <Spinner animation="border" size="lg" role="status" />
        </div>
      ) : (
        <>
          <div className="todo-header">
            <div className="todo-title">
              <div className="icon-back" onClick={() => history.push("/")} />
              {isEditTitle ? (
                <input
                  ref={titleInput}
                  onBlur={handleEditTitle}
                  onChange={(e) => setTitleState(e.target.value)}
                  value={titleState}
                />
              ) : (
                <h1 onClick={handleEditTitle}>{titleState}</h1>
              )}
              <div className="icon-edit-h" onClick={handleEditTitle} />
            </div>
          </div>
          <div className="detail-content">
            {sortedItems.length < 1 ? (
              <div className="empty-item">
                <img src={emptyItem} alt="empty" onClick={() => setShowAddItem(true)} />
              </div>
            ) : (
              sortedItems.map((item) => (
                <div key={item.id} className="content-item">
                  <Form.Check
                    checked={item.is_active === 0}
                    type="checkbox"
                    onChange={() => handleCheckbox(item.id)}
                  />
                  <span className={item.is_active === 0 ? "todo-done" : ""}>{item.title}</span>
                  <img src={deleteIcon} alt="delete" onClick={() => setDeletedItem(item.id)} />
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default TodoDetailModule;
