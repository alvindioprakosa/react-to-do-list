import React, { useState, useEffect, useRef } from "react";
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

function TodoDetailModule() {
  const { todoId } = useParams();
  const history = useHistory();
  const titleInput = useRef(null);
  const dispatch = useDispatch();

  const { dataGetActivityDetail, isLoadingGetActivityDetail, errAddItem, errUpdateItem, dataAddItem, dataUpdateItem } = useSelector((state) => state.todo);

  const [isEditTitle, setIsEditTitle] = useState(false);
  const [titleState, setTitleState] = useState("");
  const [listItems, setListItems] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(1);
  const [showModals, setShowModals] = useState({ addItem: false, toast: false, delete: false, editItem: false });
  const [toastDetails, setToastDetails] = useState({ type: "success", message: "" });
  const [deletedItem, setDeletedItem] = useState(null);
  const [editedItem, setEditedItem] = useState(null);

  const updateActivity = (data) => dispatch(TodoActions.updateActivityRequest(data));
  const getActivityDetail = () => dispatch(TodoActions.getActivityDetailRequest(todoId));
  const resetState = () => dispatch(TodoActions.resetStateTodo());
  const updateItem = (data) => dispatch(TodoActions.updateItemRequest(data));
  const deleteItem = (id) => dispatch(TodoActions.deleteItemRequest(id));

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
  }, [dataAddItem]);

  useEffect(() => {
    if (errAddItem || errUpdateItem) {
      setShowModals((prevState) => ({ ...prevState, toast: true }));
      setToastDetails({
        type: "danger",
        message: errAddItem || errUpdateItem || "Action failed",
      });
    }
  }, [errAddItem, errUpdateItem]);

  useEffect(() => {
    const sortItems = (items) => {
      const sortFunctions = {
        1: (a, b) => b.id - a.id,
        2: (a, b) => a.id - b.id,
        3: (a, b) => a.title.localeCompare(b.title),
        4: (a, b) => b.title.localeCompare(a.title),
        5: (a, b) => b.is_active - a.is_active,
      };
      return Immutable.asMutable(items).sort(sortFunctions[activeDropdown] || sortFunctions[5]);
    };
    setListItems(sortItems(listItems));
  }, [activeDropdown]);

  const handleEditTitle = () => {
    setIsEditTitle((prev) => !prev);
    if (isEditTitle) {
      updateActivity({ id: todoId, data: { title: titleState } });
    } else {
      titleInput?.current?.focus();
    }
  };

  const handleOnBlur = () => {
    setIsEditTitle(false);
    updateActivity({ id: todoId, data: { title: titleState } });
  };

  const handleCheckboxChange = (id) => {
    const updatedItems = listItems.map((item) =>
      item.id === id ? { ...item, is_active: item.is_active === 1 ? 0 : 1 } : item
    );
    setListItems(updatedItems);
    updateItem({
      id,
      data: {
        title: updatedItems.find((item) => item.id === id).title,
        is_active: updatedItems.find((item) => item.id === id).is_active,
        priority: updatedItems.find((item) => item.id === id).priority,
      },
    });
  };

  const handleDeleteItem = () => {
    deleteItem(deletedItem);
    setListItems((prevItems) => prevItems.filter((item) => item.id !== deletedItem));
    setShowModals((prevState) => ({ ...prevState, delete: false }));
  };

  const handleOpenEditModal = (item) => {
    setEditedItem(item);
    setShowModals((prevState) => ({ ...prevState, editItem: true }));
  };

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

  return (
    <div className="container">
      {isLoadingGetActivityDetail ? (
        <div className="spinner-wrapper">
          <Spinner as="span" animation="border" size="lg" role="status" aria-hidden="true" />
        </div>
      ) : (
        <>
          <div className="todo-header">
            <div className="todo-title">
              <div className="icon-back" onClick={() => history.push("/")} data-cy="todo-back-button"></div>
              {isEditTitle ? (
                <input type="text" ref={titleInput} onBlur={handleOnBlur} onChange={(e) => setTitleState(e.target.value)} value={titleState} />
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
                  {[1, 2, 3, 4, 5].map((key) => (
                    <Dropdown.Item eventKey={key} onClick={() => setActiveDropdown(key)} data-cy="sort-selection" key={key}>
                      <div className={`d-flex item-label ${activeDropdown === key && "active"}`} data-cy={activeDropdown === key ? "sort-selection-selected" : ""}>
                        <div className={`icon-sort-${key === 1 ? 'newest' : key === 2 ? 'oldest' : key === 3 ? 'a-alpha' : key === 4 ? 'd-alpha' : 'done'}`}></div>
                        <span data-cy="sort-selection-title">{key === 1 ? 'Terbaru' : key === 2 ? 'Terlama' : key === 3 ? 'A-Z' : key === 4 ? 'Z-A' : 'Belum Selesai'}</span>
                      </div>
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
              <button className="btn btn-primary" onClick={() => setShowModals((prevState) => ({ ...prevState, addItem: true }))} id="ButtonAddDetail" data-cy="todo-add-button">
                <span className="icon-plus"></span> Tambah
              </button>
            </div>
          </div>

          <div className="detail-content">
            {listItems.length === 0 ? (
              <div className="empty-item" data-cy="todo-empty-state">
                <img src={emptyItem} alt="empty" id="TextEmptyTodo" onClick={() => setShowModals((prevState) => ({ ...prevState, addItem: true }))} />
              </div>
            ) : (
              listItems.map((item) => (
                <div key={item.id} className="content-item" data-cy="todo-item">
                  <div className="d-flex align-items-center form-check">
                    <Form.Check checked={item?.is_active === 0} type="checkbox" id={`default-${item.id}`} onChange={() => handleCheckboxChange(item.id)} data-cy="todo-item-checkbox" />
                    <div className={`label-indicator ${item.priority}`} data-cy="todo-item-priority-indicator"></div>
                    <span className={`${item?.is_active === 0 && "todo-done"}`} data-cy="todo-item-title">{item.title}</span>
                    <div className="icon-edit-p" onClick={() => handleOpenEditModal(item)} data-cy="todo-item-edit-button"></div>
                  </div>
                  <img src={deleteIcon} alt="delete" onClick={() => setDeletedItem(item.id)} data-cy="todo-item-delete-button" />
                </div>
              ))
            )}
          </div>

          <ModalAddItem show={showModals.addItem} handleClose={() => setShowModals((prevState) => ({ ...prevState, addItem: false }))} />
          <ModalEditItem show={showModals.editItem} handleClose={() => setShowModals((prevState) => ({ ...prevState, editItem: false }))} editedItem={editedItem} />
          <ModalDelete show={showModals.delete} handleClose={() => setShowModals((prevState) => ({ ...prevState, delete: false }))} handleDelete={handleDeleteItem} />
          <ModalToast show={showModals.toast} handleClose={() => setShowModals((prevState) => ({ ...prevState, toast: false }))} message={toastDetails.message} type={toastDetails.type} />
        </>
      )}
    </div>
  );
}

export default TodoDetailModule;
