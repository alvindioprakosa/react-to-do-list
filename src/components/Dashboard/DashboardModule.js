import dayjs from "dayjs";
import React, { useEffect, useState, useCallback } from "react";
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
  const addActivity = useCallback(
    () => dispatch(TodoActions.addActivityRequest({ title: "New Activity", email: "mail.yanafriyoko@gmail.com" })),
    [dispatch]
  );
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
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState("danger");
  const [deletedActivity, setDeletedActivity] = useState("");

  useEffect(() => {
    if (errAddActivity || errGetActivities || errDeleteActivity) {
      setShowToast(true);
      setToastType("danger");
      setTimeout(() => setShowToast(false), 3000); // Tutup otomatis
    }

    if (dataAddActivity || dataDeleteActivity) {
      getActivities();
      resetState();
      setShowToast(true);
      setToastType("success");
    }
  }, [errAddActivity, errGetActivities, errDeleteActivity, dataAddActivity, dataDeleteActivity, getActivities, resetState]);

  const handleClickDelete = (item) => {
    setShowDelete(true);
    setDeletedActivity(item?.id);
  };

  return (
    <div className="container">
      <div className="todo-header">
        <h1 data-cy="activity-title">Activity</h1>
        <button className="btn btn-primary" data-cy="activity-add-button" onClick={addActivity}>
          {isLoadingAddActivity ? <Spinner animation="border" size="sm" /> : "Tambah"}
        </button>
      </div>
      <div className="dashboard-content">
        {isLoadingGetActivities ? (
          <div className="spinner-wrapper">
            <Spinner animation="border" size="lg" />
          </div>
        ) : (
          <div className="row">
            {Array.isArray(dataGetActivities?.data) && dataGetActivities?.data.length === 0 && (
              <div className="empty-item" data-cy="activity-empty-state">
                <img src={emptyItem} alt="empty" onClick={addActivity} />
              </div>
            )}
            {dataGetActivities?.data?.map((item, key) => (
              <div key={item?.id} className="col-3">
                <div className="activity-card" data-cy="activity-item">
                  <div className="activity-body" onClick={() => navigate(`/detail/${item?.id}`)}>
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
            ))}
          </div>
        )}
      </div>
      <ModalDelete
        text={`Apakah anda yakin menghapus activity <strong>“${dataGetActivities?.data?.find((x) => x.id === deletedActivity)?.title}”</strong>?`}
        show={showDelete}
        deletedItem={deletedActivity}
        handleClose={() => setShowDelete(false)}
      />
      <ModalToast type={toastType} text={toastType === "success" ? "Berhasil" : "Terjadi kesalahan"} show={showToast} handleClose={() => setShowToast(false)} />
    </div>
  );
}

export default DashboardModule;
