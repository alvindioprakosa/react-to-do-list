import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import PropTypes from 'prop-types';
import { Dropdown, Form, Spinner } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router";
import Immutable from "seamless-immutable";
import deleteIcon from "../../assets/images/icon-delete.svg";
import emptyItem from "../../assets/images/empty-item.png";
import { Creators as TodoActions } from "../../redux/TodoRedux";
import ModalAddItem from "../Modals/ModalAddItem";
import ModalToast from "../Modals/ModalToast";
import ModalDelete from "../Modals/ModalDelete";
import ModalEditItem from "../Modals/ModalEditItem";

const SORT_FUNCTIONS = {
  1: (a, b) => b.id - a.id,
  2: (a, b) => a.id - b.id,
  3: (a, b) => a.title.localeCompare(b.title),
  4: (a, b) => b.title.localeCompare(a.title),
  5: (a, b) => b.is_active - a.is_active,
};

const SORT_LABELS = {
  1: 'Terbaru',
  2: 'Terlama',
  3: 'A-Z',
  4: 'Z-A',
  5: 'Belum Selesai'
};

const SORT_ICONS = {
  1: 'newest',
  2: 'oldest',
  3: 'a-alpha',
  4: 'd-alpha',
  5: 'done'
};

function TodoDetailModule() {
  const { todoId } = useParams();
  const history = useHistory();
  const titleInput = useRef(null);
  const dispatch = useDispatch();

  const { 
    dataGetActivityDetail, 
    isLoadingGetActivityDetail, 
    errAddItem, 
    errUpdateItem, 
    dataAddItem, 
    dataUpdateItem 
  } = useSelector((state) => state.todo);

  const [isEditTitle, setIsEditTitle] = useState(false);
  const [titleState, setTitleState] = useState("");
  const [listItems, setListItems] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(1);
  const [showModals, setShowModals] = useState({ 
    addItem: false, 
    toast: false, 
    delete: false, 
    editItem: false 
  });
  const [toastDetails, setToastDetails] = useState({ type: "success", message: "" });
  const [deletedItem, setDeletedItem] = useState(null);
  const [editedItem, setEditedItem] = useState(null);

  const updateActivity = useCallback((data) => dispatch(TodoActions.updateActivityRequest(data)), [dispatch]);
  const getActivityDetail = useCallback(() => dispatch(TodoActions.getActivityDetailRequest(todoId)), [dispatch, todoId]);
  const resetState = useCallback(() => dispatch(TodoActions.resetStateTodo()), [dispatch]);
  const updateItem = useCallback((data) => dispatch(TodoActions.updateItemRequest(data)), [dispatch]);
  const deleteItem = useCallback((id) => dispatch(TodoActions.deleteItemRequest(id)), [dispatch]);

  useEffect(() => {
    if (dataGetActivityDetail) {
      const items = dataGetActivityDetail?.todo_items?.map((item) => ({
        ...item,
        is_active: item?.is_active ?? 1,
      }));
      setTitleState(dataGetActivityDetail?.title);
      setListItems(items);
    }
  }, [dataGetActivityDetail]);

  useEffect(() => {
    if (dataAddItem) {
      getActivityDetail();
      resetState();
    }
  }, [dataAddItem, getActivityDetail, resetState]);

  useEffect(() => {
    if (errAddItem || errUpdateItem) {
      setShowModals((prevState) => ({ ...prevState, toast: true }));
      setToastDetails({
        type: "danger",
        message: errAddItem || errUpdateItem || "Action failed",
      });
    }
  }, [errAddItem, errUpdateItem]);

  const sortedItems = useMemo(() => {
    return Immutable.asMutable(listItems).sort(SORT_FUNCTIONS[activeDropdown] || SORT_FUNCTIONS[5]);
  }, [listItems, activeDropdown]);

  const handleEditTitle = useCallback(() => {
    setIsEditTitle((prev) => !prev);
    if (isEditTitle) {
      updateActivity({ id: todoId, data: { title: titleState } });
    } else {
      titleInput?.current?.focus();
    }
  }, [isEditTitle, todoId, titleState, updateActivity]);

  const handleOnBlur = useCallback(() => {
    setIsEditTitle(false);
    updateActivity({ id: todoId, data: { title: titleState } });
  }, [todoId, titleState, updateActivity]);

  const handleCheckboxChange = useCallback((id) => {
    const updatedItems = listItems.map((item) =>
      item.id === id ? { ...item, is_active: item.is_active === 1 ? 0 : 1 } : item
    );
    setListItems(updatedItems);
    const updatedItem = updatedItems.find((item) => item.id === id);
    updateItem({
      id,
      data: {
        title: updatedItem.title,
        is_active: updatedItem.is_active,
        priority: updatedItem.priority,
      },
    });
  }, [listItems, updateItem]);

  const handleDeleteItem = useCallback(() => {
    deleteItem(deletedItem);
    setListItems((prevItems) => prevItems.filter((item) => item.id !== deletedItem));
    setShowModals((prevState) => ({ ...prevState, delete: false }));
  }, [deletedItem, deleteItem]);

  const handleOpenEditModal = useCallback((item) => {
    setEditedItem(item);
    setShowModals((prevState) => ({ ...prevState, editItem: true }));
  }, []);

  const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <div ref={ref} onClick={(e) => { e.preventDefault(); onClick(e); }}>
      {children}
    </div>
  ));

  const CustomMenu = React.forwardRef(({ children, style, className, "aria-labelledby": labeledBy }, ref) => (
    <div ref={ref} style={style} className={className} aria-labelledby={labeledBy}>
      <ul className="list-unstyled">{children}</ul>
    </div>
  ));

  if (isLoadingGetActivityDetail) {
    return (
      <div className="spinner-wrapper">
        <Spinner as="span" animation="border" size="lg" role="status" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="container">
      <div className="todo-header">
        <div className="todo-title">
          <div className="icon-back" onClick={() => history.push("/")} data-cy="todo-back-button"></div>
          {isEditTitle ? (
            <input 
              type="text" 
              ref={titleInput} 
              onBlur={handleOnBlur} 
              onChange={(e) => setTitleState(e.target.value)} 
              value={titleState} 
            />
          ) : (
            <h1 id="TitleDetail" onClick={handleEditTitle} data-cy="todo-title">{titleState}</h1>
          )}
          <div className="icon-edit-h" onClick={handleEditTitle} data-cy="todo-title-edit-button"></div>
        </div>
        <div className="d-flex">
          <Dropdown>
            <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components">
              <button id="ButtonSort" className="btn-sort" data-cy="todo-sort-button">
                <div className="icon-sort"></div>
              </button>
            </Dropdown.Toggle>
            <Dropdown.Menu as={CustomMenu} data-cy="sort-parent">
              {Object.entries(SORT_LABELS).map(([key, label]) => (
                <Dropdown.Item 
                  eventKey={key} 
                  onClick={() => setActiveDropdown(Number(key))} 
                  data-cy="sort-selection" 
                  key={key}
                >
                  <div 
                    className={`d-flex item-label ${activeDropdown === Number(key) && "active"}`} 
                    data-cy={activeDropdown === Number(key) ? "sort-selection-selected" : ""}
                  >
                    <div className={`icon-sort-${SORT_ICONS[key]}`}></div>
                    <span data-cy="sort-selection-title">{label}</span>
                  </div>
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowModals((prevState) => ({ ...prevState, addItem: true }))} 
            id="ButtonAddDetail" 
            data-cy="todo-add-button"
          >
            <span className="icon-plus"></span> Tambah
          </button>
        </div>
      </div>

      <div className="detail-content">
        {sortedItems.length === 0 ? (
          <div className="empty-item" data-cy="todo-empty-state">
            <img 
              src={emptyItem} 
              alt="empty" 
              id="TextEmptyTodo" 
              onClick={() => setShowModals((prevState) => ({ ...prevState, addItem: true }))} 
            />
          </div>
        ) : (
          sortedItems.map((item) => (
            <div key={item.id} className="content-item" data-cy="todo-item">
              <div className="d-flex align-items-center form-check">
                <Form.Check 
                  checked={item?.is_active === 0} 
                  type="checkbox" 
                  id={`default-${item.id}`} 
                  onChange={() => handleCheckboxChange(item.id)} 
                  data-cy="todo-item-checkbox" 
                />
                <div className={`label-indicator ${item.priority}`} data-cy="todo-item-priority-indicator"></div>
                <span className={`${item?.is_active === 0 && "todo-done"}`} data-cy="todo-item-title">
                  {item.title}
                </span>
                <div 
                  className="icon-edit-p" 
                  onClick={() => handleOpenEditModal(item)} 
                  data-cy="todo-item-edit-button"
                ></div>
              </div>
              <img 
                src={deleteIcon} 
                alt="delete" 
                onClick={() => setDeletedItem(item.id)} 
                data-cy="todo-item-delete-button" 
              />
            </div>
          ))
        )}
      </div>

      <ModalAddItem 
        show={showModals.addItem} 
        handleClose={() => setShowModals((prevState) => ({ ...prevState, addItem: false }))} 
      />
      <ModalEditItem 
        show={showModals.editItem} 
        handleClose={() => setShowModals((prevState) => ({ ...prevState, editItem: false }))} 
        editedItem={editedItem} 
      />
      <ModalDelete 
        show={showModals.delete} 
        handleClose={() => setShowModals((prevState) => ({ ...prevState, delete: false }))} 
        handleDelete={handleDeleteItem} 
      />
      <ModalToast 
        show={showModals.toast} 
        handleClose={() => setShowModals((prevState) => ({ ...prevState, toast: false }))} 
        message={toastDetails.message} 
        type={toastDetails.type} 
      />
    </div>
  );
}

TodoDetailModule.propTypes = {
  todoId: PropTypes.string.isRequired
};

export default React.memo(TodoDetailModule);