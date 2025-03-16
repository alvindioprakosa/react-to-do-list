import React, { lazy, Suspense, useEffect } from "react";
import { useDispatch } from "react-redux";
import { titlePage } from "../lib/titleHead";
import { Creators as TodoActions } from "../redux/TodoRedux";

// Lazy load the components
const DashboardModule = lazy(() => import("../components/Dashboard/DashboardModule"));
const Header = lazy(() => import("../layout/Header"));

// Custom hook to handle activities fetching
const useFetchActivities = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(TodoActions.getActivitiesRequest());
  }, [dispatch]);
};

function Dashboard() {
  // Set the page title on component mount
  useEffect(() => {
    titlePage({ title: "To Do List - Dashboard" });
  }, []);

  // Fetch activities using custom hook
  useFetchActivities();

  return (
    <>
      <Suspense fallback={<p>Loading Header...</p>}>
        <Header />
      </Suspense>
      <Suspense fallback={<p>Loading Dashboard...</p>}>
        <DashboardModule />
      </Suspense>
    </>
  );
}

export default Dashboard;
