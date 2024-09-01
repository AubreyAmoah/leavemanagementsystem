import { faEnvelope, faEnvelopeOpen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";

const Notifications = ({
  visible,
  query,
  notificationCollectionRef,
  where,
  getDocs,
  auth,
  updateDoc,
  doc,
  getTotalUnreadNotifications,
}) => {
  const [notificationList, setNotificationList] = useState([]);

  const userId = auth?.currentUser?.uid;

  const getNotificationList = async () => {
    try {
      const q = query(notificationCollectionRef, where("userId", "==", userId));
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

  const readNotification = async (id) => {
    try {
      const notification = doc(notificationCollectionRef, id);
      await updateDoc(notification, { read: true });
      getNotificationList();
      getTotalUnreadNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  useState(() => {
    getNotificationList();
  });
  return (
    <div
      className={`${
        visible ? "absolute" : "hidden"
      } top-[50px] right-[20px] border-t-[1px] border-t-zinc-50 w-[350px] max-h-[500px] bg-white shadow-md text-teal-600 max-[460px]:w-full max-[460px]:right-0`}
    >
      <h1 className="w-full bg-teal-600 text-zinc-50 h-[50px] flex items-center justify-center">
        Notifications
      </h1>

      <div className="flex flex-col p-4 w-full max-h-[450px] overflow-auto">
        {notificationList.map((notification) => (
          <span
            onMouseOver={() => readNotification(notification.id)}
            key={notification.id}
            className={`${
              notification.read ? "font-normal" : "font-bold"
            } text-teal-500 relative flex items-center p-4 cursor-pointer break-words hover:bg-zinc-100 hover:p-4`}
          >
            {notification.read ? (
              <FontAwesomeIcon icon={faEnvelopeOpen} />
            ) : (
              <FontAwesomeIcon icon={faEnvelope} />
            )}

            <p className="ml-2">{notification.message}</p>
            <p className="absolute right-0 bottom-0 text-sm font-extralight">
              {notification.created.toGMTString()}
            </p>
          </span>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
