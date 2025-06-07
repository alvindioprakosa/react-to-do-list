import dayjs from "dayjs";
import React, { useCallback, useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // ✅ Ganti useHistory dengan useNavigate
import deleteIcon from "../../assets/images/icon-delete.svg";
import ModalDelete from "../Modals/ModalDelete";
import "dayjs/locale/id";
import ModalToast from "../Modals/ModalToast";
import { Creators as TodoActions } from "../../redux/TodoRedux";
import emptyItem from "../../assets/images/empty-activity.png";

function DashboardModule() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const getActivities = useCallback(() => dispatch(TodoActions.getActivitiesRequest()), [dispatch]);
  const addActivity = useCallback((data) => dispatch(TodoActions.addActivityRequest(data)), [dispatch]);
  const resetState = useCallback(() => dispatch(TodoActions.resetStateTodo()), [dispatch]);

  const {
    dataGetActivities,
    errGetActivities,
    isLoadingGetActivities,
    dataAddActivity,
    errAddActivity,
    dataDeleteActivity,
    errDeleteActivity,
    isLoadingAddActivity,
  } = useSelector((state) => state.todo);


  const [showDelete, setShowDelete] = useState(false);
  const [deletedActivity, setDeletedActivity] = useState("");
  const [toast, setToast] = useState({ show: false, text: "", type: "danger" });

  const showToast = useCallback((text, type = "danger") => {
    setToast({ show: true, text, type });
  }, []);

  const handleAddActivity = () => {
    addActivity({ title: "New Activity", email: "mail.yanafriyoko@gmail.com" });
  };

  const handleClickDelete = (item) => {
    setShowDelete(true);
    setDeletedActivity(item?.id);
    showToast(`Apakah anda yakin menghapus activity <strong>\u201c${item?.title}\u201d</strong>?`, "danger");
  };

  useEffect(() => {
    if (errAddActivity || errGetActivities || errDeleteActivity) {
      const message = errAddActivity || errGetActivities || errDeleteActivity || "Terjadi kesalahan";
      showToast(message);
      resetState();
    }

    if (dataAddActivity) {
      getActivities();
      resetState();
    }

    if (dataDeleteActivity) {
      getActivities();
      showToast("Activity berhasil dihapus", "success");
    }
  }, [errAddActivity, errGetActivities, errDeleteActivity, dataAddActivity, dataDeleteActivity, getActivities, resetState, showToast]);

  return (
    <div className="container">
      <div className="todo-header">
        <h1 data-cy="activity-title">Activity</h1>
        <button
          className="btn btn-primary"
          data-cy="activity-add-button"
          onClick={handleAddActivity}
        >
          {isLoadingAddActivity ? (
            <Spinner animation="border" size="md" role="status" aria-hidden="true" />
          ) : (
            <>
              <span className="icon-plus"></span> Tambah
            </>
          )}
        </button>
      </div>

      <div className="dashboard-content">
        {isLoadingGetActivities ? (
          <div className="spinner-wrapper">
            <Spinner animation="border" size="lg" role="status" aria-hidden="true" />
          </div>
        ) : (
          <div className="row">
            {dataGetActivities?.data?.length < 1 ? (
              <div className="empty-item" data-cy="activity-empty-state">
                <img src={emptyItem} alt="empty" onClick={addActivity} />
              </div>
            ) : (
              dataGetActivities?.data?.map((item, key) => (
                <div key={item?.id} className="col-3">
                  <div className="activity-card" data-cy="activity-item" id={`itemTodo${key}`}>
                    <div className="activity-body" onClick={() => history.push(`/detail/${item?.id}`)}>
                      <h4 data-cy="activity-item-title">{item?.title}</h4>
                    </div>
                    <div className="card-footer">
                      <span data-cy="activity-item-date">
                        {dayjs(item?.created_at).locale("id").format("DD MMMM YYYY")}
                      </span>
                      <img
                        src={deleteIcon}
                        onClick={() => handleClickDelete(item)}
                        alt="delete"
                        data-cy="activity-item-delete-button"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <ModalDelete
        text={modalText}
        show={showDelete}
        deletedItem={deletedActivity}
        handleClose={() => setShowDelete(false)}
      />
      <ModalToast
        type={toastType}
        text={modalText}
        show={showToast}
        handleClose={() => setShowToast(false)}
      />
    </div>
  );
}

export default DashboardModule;
