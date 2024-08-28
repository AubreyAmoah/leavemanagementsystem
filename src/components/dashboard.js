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

const Dashboard = () => {
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
    }
  };

  useEffect(() => {
    getLeaveList();

    // localStorage.setItem("leaveData", JSON.stringify(newLeave));
  }, []);

  const onSubmitLeaveRequests = async () => {
    try {
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
    }
  };

  const deleteLeaveRequests = async (id) => {
    try {
      const leaveDoc = doc(db, "leaveRequest", id);
      await deleteDoc(leaveDoc);
      getLeaveList();
    } catch (error) {
      console.error(error);
    }
  };

  const updateLeaveReason = async (id) => {
    try {
      const leaveDoc = doc(db, "leaveRequest", id);
      await updateDoc(leaveDoc, { reason: updatedReason });
      getLeaveList();
    } catch (error) {
      console.error(error);
    }
  };
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div>
      <button onClick={logout}> Logout</button>
      <div>
        <input
          type="text"
          placeholder="Leave Reason"
          onChange={(e) => setLeave({ ...newLeave, reason: e.target.value })}
        />
        <input
          type="number"
          min={0}
          placeholder="Number of days on leave"
          onChange={(e) =>
            setLeave({ ...newLeave, duration: Number(e.target.value) })
          }
        />
        <button onClick={onSubmitLeaveRequests}>Done</button>
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
