import { faEnvelope, faEnvelopeOpen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";

const Notifications = ({ visible }) => {
  const [read, setRead] = useState(true);
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
        <span
          className={`${
            read ? "font-normal" : "font-bold"
          } text-teal-500 mb-4 flex items-center p-4 cursor-pointer break-words hover:bg-zinc-100 hover:p-4`}
        >
          {read ? (
            <FontAwesomeIcon icon={faEnvelopeOpen} />
          ) : (
            <FontAwesomeIcon icon={faEnvelope} />
          )}

          <p className="ml-2">This is a test notification</p>
        </span>
      </div>
    </div>
  );
};

export default Notifications;
