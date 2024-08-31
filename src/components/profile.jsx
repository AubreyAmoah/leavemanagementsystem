import { faCheck, faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { auth } from "../config/firebase.config";

const Profile = ({ visible, query, userCollectionRef, where, getDocs }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [nameEdit, setNameEdit] = useState(false);
  const [phoneEdit, setPhonEdit] = useState(false);

  const toggleNameEdit = () => {
    setNameEdit(!nameEdit);
  };

  const togglePhoneEdit = () => {
    setPhonEdit(!phoneEdit);
  };

  const getUser = async () => {
    const userEmail = auth?.currentUser?.email;
    const q = query(userCollectionRef, where("email", "==", userEmail));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.docs[0]) {
      const name = querySnapshot.docs[0].namme;
      const phone = querySnapshot.docs[0].phone;

      setName(name);
      setPhone(phone);
    }
    return;
  };

  useEffect(() => {
    getUser();
  });
  return (
    <div
      className={`${
        visible ? "absolute" : "hidden"
      } top-[50px] right-[20px] border-t-[1px] border-t-zinc-50 w-[400px] max-h-[500px] bg-white shadow-md text-teal-600 max-[460px]:w-full max-[460px]:right-0`}
    >
      <h1 className="w-full bg-teal-600 text-zinc-50 h-[50px] flex items-center justify-center">
        Profile
      </h1>
      <div className="flex flex-col items-center justify-center p-4 w-full max-h-[450px] overflow-auto">
        <div className="mb-6">
          <img
            src={
              auth.currentUser.photoURL ||
              "https://cdn.pixabay.com/photo/2013/07/13/12/07/avatar-159236_1280.png"
            }
            height={200}
            width={200}
            alt="profile image"
          />
        </div>

        <div className="flex items-center mb-4">
          <p className="mr-4">
            {name ||
              (auth.currentUser.displayName === null || undefined
                ? "No Name Yet"
                : auth.currentUser.displayName)}
          </p>
          <button onClick={toggleNameEdit}>
            <FontAwesomeIcon icon={faEdit} />
          </button>
        </div>

        <div
          className={`${
            nameEdit === false ? "hidden" : "flex"
          } items-center mb-6 h-8`}
        >
          <input
            className="p-2 outline-none caret-teal-500 text-teal-500 border border-zinc-300 focus:border-teal-600 mr-2"
            type="text"
            name=""
            id=""
            placeholder="New Name.."
          />
          <button className="bg-teal-600 text-zinc-50 px-2 hover:text-teal-500 hover:bg-zinc-50">
            <FontAwesomeIcon icon={faCheck} />
          </button>
        </div>

        <div className="flex items-center mb-4">
          <p className="mr-4">
            {phone ||
              (auth.currentUser.phoneNumber === null || undefined
                ? "No Phone Number Yet"
                : auth.currentUser.phoneNumber)}
          </p>
          <button onClick={togglePhoneEdit}>
            <FontAwesomeIcon icon={faEdit} />
          </button>
        </div>

        <div
          className={`${
            phoneEdit === false ? "hidden" : "flex"
          } items-center mb-6 h-8`}
        >
          <input
            className="p-2 outline-none caret-teal-500 text-teal-500 border border-zinc-300 focus:border-teal-600 mr-2"
            type="text"
            name=""
            id=""
            placeholder="+2332456....78"
          />
          <button className="bg-teal-600 text-zinc-50 px-2 hover:text-teal-500 hover:bg-zinc-50">
            <FontAwesomeIcon icon={faCheck} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
