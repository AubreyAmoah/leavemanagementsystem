import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useState } from "react";
import { auth, googlProvider } from "../config/firebase.config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const signIn = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.log(error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googlProvider);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col w-[400px] p-4 rounded-md shadow-md max-[460px]:w-screen">
      <h1 className="p-4 w-full font-bold text-2xl text-zinc-50 bg-teal-600 mb-6">
        REMOTOWN
      </h1>
      <input
        className="p-4 rounded-md outline-none caret-teal-500 text-teal-500 border border-zinc-300 mb-4 focus:border-teal-600"
        placeholder="Email..."
        type="email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="p-4 rounded-md outline-none caret-teal-500 text-teal-500 border border-zinc-300 mb-4 focus:border-teal-600"
        placeholder="Password..."
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        className="w-full mb-4 rounded-sm bg-teal-600 text-zinc-50 border border-teal-600 p-4 hover:bg-zinc-50 hover:text-teal-600"
        onClick={signIn}
      >
        Sign In
      </button>
      <button
        className="flex text-center items-center justify-center w-full bg-red-500 text-zinc-50 rounded-sm border border-red-500 p-4 hover:bg-zinc-50 hover:text-red-500"
        onClick={signInWithGoogle}
      >
        <FontAwesomeIcon icon="fa-brands fa-google" />
        Sign In With Google
      </button>
    </div>
  );
};
