import React, { useEffect, useState } from "react";
import { auth, db } from "../config/firebase.config";
import { signOut } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import Loading from "./loading";

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [leaveList, setLeaveList] = useState([]);
  const [newLeave, setLeave] = useState({
    reason: "",
    duration: 0,
    approved: false,
    applicationDate: serverTimestamp(),
    approvalDate: serverTimestamp(),
  });
  const [updatedReason, setUpdatedReason] = useState("");
  const [updatedDuration, setUpdatedDuration] = useState(0);

  const leaveCollectionRef = collection(db, "leaveRequest");

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
      console.log(filteredData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getLeaveList();

    // localStorage.setItem("leaveData", JSON.stringify(newLeave));
  }, []);

  const onSubmitLeaveRequests = async () => {
    try {
      setIsLoading(true);
      await addDoc(leaveCollectionRef, {
        reason: newLeave.reason,
        duration: newLeave.duration,
        approved: true,
        applicationDate: newLeave.applicationDate,
        approvalDate: newLeave.approvalDate,
        userId: auth?.currentUser?.uid,
      });
      getLeaveList();
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
  return (
    <div>
      {isLoading === true && <Loading />}

      <nav className="flex w-full h-[50px] justify-end bg-teal-600">
        <button className="text-zinc-50 mr-4 font-bold" onClick={logout}>
          Logout
        </button>
      </nav>

      <div className=" ml-auto mr-auto text-center mt-4">
        <input
          className="p-4 rounded-md outline-none caret-teal-500 text-teal-500 border border-zinc-300 mb-4 focus:border-teal-600 mr-6"
          type="text"
          placeholder="Leave Reason"
          onChange={(e) => setLeave({ ...newLeave, reason: e.target.value })}
        />
        <input
          className="p-4 rounded-md outline-none caret-teal-500 text-teal-500 border border-zinc-300 mb-4 focus:border-teal-600 mr-6"
          type="number"
          min={0}
          placeholder="Number of days on leave"
          onChange={(e) =>
            setLeave({ ...newLeave, duration: Number(e.target.value) })
          }
        />
        <button
          className="mb-4 rounded-sm bg-teal-600 text-zinc-50 border border-teal-600 p-4 hover:bg-zinc-50 hover:text-teal-600"
          onClick={onSubmitLeaveRequests}
        >
          Done
        </button>
      </div>
      <div>
        {leaveList.map((leave) => (
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
      </div>
    </div>
  );
};

export default Dashboard;
