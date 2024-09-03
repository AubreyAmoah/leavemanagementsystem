import React, { useEffect, useState } from "react";
import { auth, db } from "../config/firebase.config";
import { signOut } from "firebase/auth";
import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import Loading from "./loading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCancel,
  faDoorClosed,
  faTools,
} from "@fortawesome/free-solid-svg-icons";
import Notifications from "./notifications";
import Profile from "./profile";
import toast from "react-hot-toast";

const Dashboard = () => {
  /** Date Use States */
  // use state for current system date
  const [currentDate, setCurrentDate] = useState(null);

  //use state for maximum date of start date
  const [maxDate, setMaxDate] = useState(null);

  //use state for minimum date for end date
  const [minStartDate, setMinStartDate] = useState(null);

  //use state for active state for end date
  const [isEndDateInputActive, setIsEndInputActive] = useState(false);

  // use state for maximum date of end date
  const [maxDateAfter, setMaxDateAfter] = useState(null);

  /** End of Date Use states */

  const [isAdmin, setAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [leaveList, setLeaveList] = useState([]);
  const [personalLeaveList, setPersonalLeaveList] = useState([]);
  const [newLeave, setLeave] = useState({
    reason: "",
    approved: false,
    applicationDate: serverTimestamp(),
    startDate: null,
    endDate: null,
    approvalDate: null,
    cancelled: false,
  });

  const [cancelledLeave, setCancelledLeave] = useState({
    leaveId: "",
    dateCancelled: "",
    daysLeft: "",
  });
  const [updatedReason, setUpdatedReason] = useState("");

  const [notificationVisibility, setNotificationVisibility] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState(false);
  const [notificationList, setNotificationList] = useState([]);
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

  const emptyFunction = () => {
    return;
  };

  const calculateLeaveDuration = async (id) => {
    try {
      const leaveDocRef = doc(leaveCollectionRef, id);

      const docSnap = await getDoc(leaveDocRef);

      if (docSnap.exists()) {
        const startDate = docSnap.data().startDate.toDate();
        const endDate = docSnap.data().endDate.toDate();

        let Difference_In_Time = endDate.getTime() - startDate.getTime();

        let Difference_In_Days = Math.round(
          Difference_In_Time / (1000 * 3600 * 24)
        );
        return Difference_In_Days;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getLeaveListByUserId = async () => {
    try {
      const userId = auth?.currentUser?.uid;
      const q = query(
        leaveCollectionRef,
        where("userId", "==", userId),
        where("cancelled", "==", false),
        orderBy("applicationDate", "desc")
      );
      const querySnapshot = await getDocs(q);
      const filteredData = querySnapshot.docs.map((doc) => ({
        reason: doc.data().reason,
        approved: doc.data().approved,
        applicationDate:
          doc.data().applicationDate !== null || ""
            ? doc.data().applicationDate.toDate()
            : doc.data().applicationDate,
        approvalDate:
          doc.data().approvalDate !== null || ""
            ? doc.data().approvalDate.toDate()
            : doc.data().approvalDate,
        startDate:
          doc.data().startDate !== null || ""
            ? doc.data().startDate.toDate()
            : doc.data().startDate,
        endDate:
          doc.data().endDate !== null || ""
            ? doc.data().endDate.toDate()
            : doc.data().endDate,
        duration() {
          const startDate = doc.data().startDate.toDate();
          const endDate = doc.data().endDate.toDate();

          let Difference_In_Time = endDate.getTime() - startDate.getTime();

          let Difference_In_Days = Math.round(
            Difference_In_Time / (1000 * 3600 * 24)
          );
          return Difference_In_Days;
        },
        daysLeft() {
          const startDate = doc.data().startDate.toDate();
          const current = Timestamp.now().toDate();
          const endDate = doc.data().endDate.toDate();

          if (startDate <= current) {
            let Difference_In_Time = endDate.getTime() - current.getTime();

            let Difference_In_Days = Math.round(
              Difference_In_Time / (1000 * 3600 * 24)
            );
            return Difference_In_Days + " days";
          }

          return "Not started yet";
        },
        id: doc.id,
      }));

      return setPersonalLeaveList(filteredData);
    } catch (error) {
      console.log(error);
    } finally {
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

  const getNotificationList = async () => {
    const userId = auth?.currentUser?.uid;
    try {
      const q = query(
        notificationCollectionRef,
        where("userId", "==", userId),
        orderBy("created", "desc")
      );
      const querySnapshot = await getDocs(q);

      const filteredData = querySnapshot.docs.map((doc) => ({
        created: doc.data().created.toDate(),
        message: doc.data().message,
        read: doc.data().read,
        timeRead: doc.data().timeRead,
        userId: doc.data().userId,
        id: doc.id,
      }));

      setNotificationList(filteredData);
    } catch (error) {
      console.error(error);
    } finally {
    }
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

  const onSubmitLeaveRequests = async () => {
    try {
      setIsButtonLoading(true);
      const result = await addDoc(leaveCollectionRef, {
        ...newLeave,
        startDate: Timestamp.fromDate(new Date(newLeave.startDate)),
        endDate: Timestamp.fromDate(new Date(newLeave.endDate)),
        userId: auth?.currentUser?.uid,
      });
      if (result) {
        getLeaveListByUserId();
        return toast.success("Leave Request submitted");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsButtonLoading(false);
    }
  };

  const deleteLeaveRequests = async (id) => {
    try {
      setIsLoading(true);
      const leaveDoc = doc(db, "leaveRequest", id);
      await deleteDoc(leaveDoc);
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
    getNotificationList();
    getTotalUnreadNotifications();
    setCurrentDate(formattedDate);

    setMaxDate(formattedMaxDate);

    // const futureMax = new Date(max.setDate(max.getDate() + 30));
    // const formattedFutureMaxDate = futureMax.toISOString().slice(0, 16);
    // setMaxDateAfter(formattedFutureMaxDate);

    changeEndDateStartDate();
    getLeaveListByUserId();

    // localStorage.setItem("leaveData", JSON.stringify(newLeave));

    changeEndDateStartDate(newLeave.startDate);
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
        notificationList={notificationList}
        getNotificationList={getNotificationList}
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

      <>
        <div className="flex items-center justify-center flex-wrap mt-4 max-[990px]:flex-col">
          <input
            className="p-4 rounded-md outline-none caret-teal-500 text-teal-500 border border-zinc-300 mb-4 focus:border-teal-600 mr-6 max-[700px]:w-full"
            type="text"
            placeholder="Leave Reason"
            onChange={(e) => setLeave({ ...newLeave, reason: e.target.value })}
          />
          <label htmlFor="timestart">Start Date: </label>
          <input
            id="timestart"
            className="p-4 rounded-md outline-none caret-teal-500 text-teal-500 border border-zinc-300 ml-2 mb-4 focus:border-teal-600 mr-6 max-[700px]:w-full"
            type="datetime-local"
            min={currentDate}
            max={maxDate}
            onChange={(e) => {
              setLeave({ ...newLeave, startDate: e.target.value });
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
            onChange={(e) => {
              setLeave({ ...newLeave, endDate: e.target.value });
            }}
          />
          <button
            className={`${
              isButtonLoading
                ? "cursor-not-allowed bg-stone-400 text-teal-600"
                : " bg-teal-600 text-zinc-50 border border-teal-600 hover:bg-zinc-50 hover:text-teal-600"
            } mb-4 rounded-sm p-4 max-[300px]:w-full`}
            onClick={isButtonLoading ? emptyFunction : onSubmitLeaveRequests}
          >
            {isButtonLoading ? "Submitting" : "Submit Leave Request"}
          </button>
        </div>
      </>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Reason</th>
              <th className="py-3 px-6 text-left">Start Date</th>
              <th className="py-3 px-6 text-left">End Date</th>
              <th className="py-3 px-6 text-left">Duration</th>
              <th className="py-3 px-6 text-left">Date Applied</th>
              <th className="py-3 px-6 text-left">Approved</th>
              <th className="py-3 px-6 text-left">Date Approved</th>
              <th className="py-3 px-6 text-left">Remaining Days</th>
              <th className="py-3 px-6 text-left"></th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {personalLeaveList.map((leave) => (
              <tr
                className="border-b border-gray-200 hover:bg-gray-100"
                key={leave.id}
              >
                <td className="py-3 px-6 text-left whitespace-nowrap">
                  <h1
                    className={`${
                      leave.approved === true
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {leave.reason}
                  </h1>
                </td>

                <td className="py-3 px-6 text-left whitespace-nowrap">
                  <p>
                    {(leave.startDate !== null || undefined || ""
                      ? leave.startDate.toGMTString()
                      : leave.startDate) || "N/A"}
                  </p>
                </td>

                <td className="py-3 px-6 text-left whitespace-nowrap">
                  <p>
                    {(leave.endDate !== null || undefined || ""
                      ? leave.endDate.toGMTString()
                      : leave.endDate) || "N/A"}
                  </p>
                </td>
                <td className="py-3 px-6 text-left whitespace-nowrap">
                  <p>{leave.duration()} days</p>
                </td>
                <td className="py-3 px-6 text-left whitespace-nowrap">
                  <p>
                    {(leave.applicationDate !== null || undefined || ""
                      ? leave.applicationDate.toGMTString()
                      : leave.applicationDate) || "N/A"}
                  </p>
                </td>
                <td className="py-3 px-6 text-left whitespace-nowrap">
                  <span
                    className={`${
                      leave.approved === true
                        ? "bg-green-600 px-2 text-zinc-50"
                        : "bg-red-600 px-2 text-zinc-50"
                    }`}
                  >
                    {leave.approved === true ? "yes" : "no"}
                  </span>
                </td>
                <td className="py-3 px-6 text-left whitespace-nowrap">
                  <p>
                    {(leave.approvalDate !== null || undefined || ""
                      ? leave.approvalDate.toGMTString()
                      : leave.approvalDate) || "Not Approved"}
                  </p>
                </td>

                <td className="py-3 px-6 text-left whitespace-nowrap">
                  <p className="w-[200px]">{leave.daysLeft()}</p>
                </td>
                <td className="py-3 px-6 text-left whitespace-nowrap">
                  <button className="flex items-center bg-red-600 p-2 text-zinc-50 border border-red-600 hover:bg-zinc-50 hover:text-red-600">
                    <FontAwesomeIcon className="mr-2" icon={faCancel} />
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
