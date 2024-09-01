import React, { useEffect, useState } from "react";
import { auth, db } from "../config/firebase.config";
import { signOut } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import Loading from "./loading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faDoorClosed,
  faTools,
} from "@fortawesome/free-solid-svg-icons";
import Notifications from "./notifications";
import Profile from "./profile";

const Dashboard = () => {
  /** Date Use States */
  // use state for current system date
  const [currentDate, setCurrentDate] = useState(null);

  //use state for maximum date of start date
  const [maxDate, setMaxDate] = useState(null);

  //use state for minimum date for end date
  const [minStartDate, setMinStartDate] = useState(null);

  //use state for selected date for start date
  const [selectedDate, setSelectedDate] = useState(null);

  //use state for active state for end date
  const [isEndDateInputActive, setIsEndInputActive] = useState(false);

  // use state for maximum date of end date
  const [maxDateAfter, setMaxDateAfter] = useState(null);

  //use state for selected date for end date
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  /** End of Date Use states */

  const [isAdmin, setAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [leaveList, setLeaveList] = useState([]);
  const [personalLeaveList, setPersonalLeaveList] = useState([]);
  const [newLeave, setLeave] = useState({
    reason: "",
    approved: false,
    applicationDate: serverTimestamp(),
    startDate: serverTimestamp(selectedDate) || null,
    endDate: serverTimestamp(selectedEndDate) || null,
    approvalDate: null,
  });
  const [updatedReason, setUpdatedReason] = useState("");

  const [notificationVisibility, setNotificationVisibility] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState(false);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [updatedDuration, setUpdatedDuration] = useState(0);

  /** Collection Refs */
  const leaveCollectionRef = collection(db, "leaveRequests");
  const userCollectionRef = collection(db, "users");
  const notificationCollectionRef = collection(db, "notifications");
  /**End */

  /** Date functionalities */
  // calculate for current date, convert to iso string
  const now = new Date(Date.now());
  const formattedDate = now.toISOString().slice(0, 16);

  // Calculate maximum date allowed by adding 30 days to currentdate
  const max = new Date(now.setDate(now.getDate() + 30));
  const formattedMaxDate = max.toISOString().slice(0, 16);

  // Add one day to current date, convert to iso string and set to MinStartDate useState
  const changeEndDateStartDate = (selectedDate) => {
    if (selectedDate !== undefined) {
      const newDate = new Date(selectedDate);
      const futureNow = new Date(newDate.setDate(newDate.getDate() + 1));
      const formattedFutureNowDate = futureNow.toISOString().slice(0, 16);

      setMinStartDate(formattedFutureNowDate);

      const max = new Date(newDate.setDate(newDate.getDate() + 60));
      const formattedMaxDate = max.toISOString().slice(0, 16);
      setMaxDateAfter(formattedMaxDate);
    }
  };

  /**End  */

  const getLeaveList = async () => {
    try {
      setIsLoading(true);
      const data = await getDocs(leaveCollectionRef);
      const filteredData = data.docs.map((doc) => ({
        //   ...doc.data(),
        reason: doc.data().reason,
        duration: doc.data().duration,
        approved: doc.data().approved,
        applicationDate: doc.data().applicationDate.toDate(),
        approvalDate: doc.data().approvalDate.toDate(),
        id: doc.id,
      }));
      setLeaveList(filteredData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getLeaveListByUserId = async () => {
    try {
      setIsLoading(true);
      const userId = auth?.currentUser?.uid;
      const q = query(leaveCollectionRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const filteredData = querySnapshot.docs.map((doc) => ({
        reason: doc.data().reason,
        approved: doc.data().approved,
        applicationDate: doc.data().applicationDate.toDate() || "N/A",
        approvalDate: doc.data().approvalDate.toDate() || "N/A",
        id: doc.id,
      }));
      setPersonalLeaveList(filteredData);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyIsAdmin = async () => {
    const userEmail = auth?.currentUser?.email;
    const q = query(userCollectionRef, where("email", "==", userEmail));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.docs[0]) {
      if (querySnapshot.docs[0].data().role === "admin") {
        setAdmin(true);
        return;
      }
    }
    setAdmin(false);
    return;
  };

  const toggleNotification = () => {
    setNotificationVisibility(!notificationVisibility);
    setProfileVisibility(false);
  };

  const toggleProfile = () => {
    setProfileVisibility(!profileVisibility);
    setNotificationVisibility(false);
  };

  const getTotalUnreadNotifications = async () => {
    const userId = auth?.currentUser?.uid;
    try {
      const q = query(
        notificationCollectionRef,
        where("userId", "==", userId),
        where("read", "==", false)
      );
      const querySnapshot = await getDocs(q);

      const totalData = Number(querySnapshot.docs.length);

      setTotalNotifications(totalData);
    } catch (error) {
      console.error(error);
    } finally {
    }
  };

  useEffect(() => {
    getTotalUnreadNotifications();
    setCurrentDate(formattedDate);

    setMaxDate(formattedMaxDate);

    // const futureMax = new Date(max.setDate(max.getDate() + 30));
    // const formattedFutureMaxDate = futureMax.toISOString().slice(0, 16);
    // setMaxDateAfter(formattedFutureMaxDate);

    changeEndDateStartDate();

    verifyIsAdmin();
    if (isAdmin) {
      getLeaveList();
    } else {
      getLeaveListByUserId();
    }

    // localStorage.setItem("leaveData", JSON.stringify(newLeave));
  }, [isAdmin]);

  const onSubmitLeaveRequests = async () => {
    try {
      setIsLoading(true);
      await addDoc(leaveCollectionRef, {
        ...newLeave,
        userId: auth?.currentUser?.uid,
      });
      if (isAdmin) {
        getLeaveList();
      } else {
        getLeaveListByUserId();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteLeaveRequests = async (id) => {
    try {
      setIsLoading(true);
      const leaveDoc = doc(db, "leaveRequest", id);
      await deleteDoc(leaveDoc);
      getLeaveList();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateLeaveReason = async (id) => {
    try {
      setIsLoading(true);
      const leaveDoc = doc(db, "leaveRequest", id);
      await updateDoc(leaveDoc, { reason: updatedReason });
      getLeaveList();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  const logout = async () => {
    try {
      setIsLoading(true);
      await signOut(auth);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    changeEndDateStartDate(selectedDate);
  }, [changeEndDateStartDate]);
  return (
    <div className="relative">
      {isLoading === true && <Loading />}
      <Notifications
        visible={notificationVisibility}
        query={query}
        notificationCollectionRef={notificationCollectionRef}
        where={where}
        getDocs={getDocs}
        auth={auth}
        updateDoc={updateDoc}
        doc={doc}
        getTotalUnreadNotifications={getTotalUnreadNotifications}
      />
      <Profile
        visible={profileVisibility}
        query={query}
        userCollectionRef={userCollectionRef}
        where={where}
        getDocs={getDocs}
        auth={auth}
        updateDoc={updateDoc}
        doc={doc}
      />
      <nav className="flex w-full h-[50px] justify-end bg-teal-600 items-center">
        <button
          onClick={toggleNotification}
          className="text-zinc-50 mr-6 font-bold relative"
        >
          <FontAwesomeIcon className="mr-2" icon={faBell} />
          <span className="max-[460px]:hidden">Notifications</span>
          <div
            className={
              totalNotifications > 0
                ? "absolute left-[-10px] top-[-10px] bg-slate-50 text-teal-600 rounded-sm w-[10px] h-[10px] text-[12px] p-2 flex items-center justify-center"
                : "hidden"
            }
          >
            {totalNotifications}
          </div>
        </button>
        <button onClick={toggleProfile} className="text-zinc-50 mr-6 font-bold">
          <FontAwesomeIcon className="mr-2" icon={faTools} />
          <span className="max-[460px]:hidden">Setting</span>
        </button>
        <button className="text-zinc-50 mr-6 font-bold" onClick={logout}>
          <FontAwesomeIcon className="mr-2" icon={faDoorClosed} />
          <span className="max-[460px]:hidden">Logout</span>
        </button>
      </nav>

      {!isAdmin && (
        <>
          <div className="flex items-center justify-center flex-wrap mt-4 max-[990px]:flex-col">
            <input
              className="p-4 rounded-md outline-none caret-teal-500 text-teal-500 border border-zinc-300 mb-4 focus:border-teal-600 mr-6 max-[700px]:w-full"
              type="text"
              placeholder="Leave Reason"
              onChange={(e) =>
                setLeave({ ...newLeave, reason: e.target.value })
              }
            />
            <label htmlFor="timestart">Start Date: </label>
            <input
              id="timestart"
              className="p-4 rounded-md outline-none caret-teal-500 text-teal-500 border border-zinc-300 ml-2 mb-4 focus:border-teal-600 mr-6 max-[700px]:w-full"
              type="datetime-local"
              min={currentDate}
              max={maxDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setIsEndInputActive(true);
              }}
            />

            <label htmlFor="timeend">End Date: </label>
            <input
              id="timeend"
              className="p-4 rounded-md outline-none caret-teal-500 text-teal-500 border border-zinc-300 ml-2 mb-4 focus:border-teal-600 mr-6 max-[700px]:w-full"
              type="datetime-local"
              min={minStartDate}
              max={maxDateAfter}
              disabled={isEndDateInputActive ? false : true}
              onChange={(e) => setSelectedEndDate(e.target.value)}
            />
            <button
              className="mb-4 rounded-sm bg-teal-600 text-zinc-50 border border-teal-600 p-4 hover:bg-zinc-50 hover:text-teal-600 max-[300px]:w-full"
              onClick={onSubmitLeaveRequests}
            >
              Submit Leave Request
            </button>
          </div>
        </>
      )}

      <div className="flex max-w-full overflow-auto bg-stone-300 shadow-md mb-4 items-center justify-between p-4">
        <p className="w-[20%]">Reason</p>
        <p className="w-[5%]">Approved</p>
        <p className="w-[5%]">Duration</p>
        <p className="w-[15%]">Date Applied</p>
        <p className="w-[15%]">Date Approved</p>
        <p className="w-[15%]">Date End</p>
      </div>

      <div>
        {isAdmin &&
          leaveList.map((leave) => (
            <div key={leave.id}>
              <h1
                className={`${
                  leave.approved === true ? "text-green-600" : "text-red-600"
                }`}
              >
                {leave.reason}
              </h1>
              <p>
                Approved :{" "}
                <span
                  className={`${
                    leave.approved === true
                      ? "bg-green-600 px-2 text-zinc-50"
                      : "bg-red-600 px-2 text-zinc-50"
                  }`}
                >
                  {leave.approved === true ? "yes" : "no"}
                </span>
              </p>
              <p>Duration {leave.duration}</p>
              <p>Application Date: {leave.approvalDate.toGMTString()}</p>
              <p>Approval Date: {leave.approvalDate.toGMTString()}</p>
              <button onClick={() => deleteLeaveRequests(leave.id)}>
                Delete
              </button>
              <input
                type="text"
                placeholder="new reason..."
                onChange={(e) => setUpdatedReason(e.target.value)}
              />
              <button onClick={() => updateLeaveReason(leave.id)}>
                Update Reason
              </button>
            </div>
          ))}

        {!isAdmin &&
          personalLeaveList.map((leave) => (
            <div
              className="flex max-w-full overflow-auto bg-stone-100 mb-4 items-center justify-between p-4"
              key={leave.id}
            >
              <h1
                className={`${
                  leave.approved === true ? "text-green-600" : "text-red-600"
                } w-[20%] break-all`}
              >
                {leave.reason}
              </h1>
              <p className="w-[5%]">
                <span
                  className={`${
                    leave.approved === true
                      ? "bg-green-600 px-2 text-zinc-50"
                      : "bg-red-600 px-2 text-zinc-50"
                  }`}
                >
                  {leave.approved === true ? "yes" : "no"}
                </span>
              </p>
              <p className="w-[5%]">{leave.duration}</p>
              <p className="w-[15%]">{leave.approvalDate.toGMTString()}</p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Dashboard;
