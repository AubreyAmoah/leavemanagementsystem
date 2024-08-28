import React from "react";

const Loading = () => {
  return (
    <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-50 w-screen h-screen flex flex-col justify-center items-center text-teal-600 text-2xl bg-white">
      <div className="w-[200px] h-[200px] border-4 border-dashed rounded-full animate-spin mb-6 border-teal-600"></div>
      <span className=" animate-bounce">Loading</span>
    </div>
  );
};

export default Loading;
