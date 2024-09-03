import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { useState } from "react";
import { auth, db, googlProvider } from "../config/firebase.config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDoorOpen, faHouse } from "@fortawesome/free-solid-svg-icons";
import toast, { Toaster } from "react-hot-toast";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import Loading from "./loading";

export const Auth = () => {
  const [isSignUpActive, setIsSignUpActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const userCollectionRef = collection(db, "users");
  const notificationCollectionRef = collection(db, "notifications");

  const myDate = new Date(Date.now());
  const currentDate = String(myDate.toUTCString());

  const signUp = async () => {
    try {
      setIsLoading(true);
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (result) {
        const newUser = await addDoc(userCollectionRef, {
          email: auth?.currentUser?.email,
          name: "",
          role: "staff",
          phone: "",
          userId: auth?.currentUser?.uid,
        });

        if (newUser) {
          await addDoc(notificationCollectionRef, {
            message: "Congratulations on creating your account",
            created: serverTimestamp(),
            read: false,
            timeRead: null,
            userId: auth?.currentUser?.uid,
          });
          return toast.success("Sign Up Success");
        }
      }
      console.log(result);
    } catch (error) {
      toast.error("An Error Occurred");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async () => {
    try {
      setIsLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      if (result) {
        await addDoc(notificationCollectionRef, {
          message: `new login on ${currentDate}`,
          created: serverTimestamp(),
          read: false,
          timeRead: null,
          userId: auth?.currentUser?.uid,
        });

        toast.success("Sign Up Success");
      }
    } catch (error) {
      console.log(error);
      toast.error("An Error Occurred");
      setIsLoading(false);
    }
  };

  const toggleSignUp = () => {
    return setIsSignUpActive(!isSignUpActive);
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googlProvider);
      if (result) {
        const userEmail = auth?.currentUser?.email;
        const q = query(userCollectionRef, where("email", "==", userEmail));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.docs[0] === undefined) {
          const newUser = await addDoc(userCollectionRef, {
            email: auth?.currentUser?.email,
            name: auth?.currentUser?.displayName,
            role: "employee",
            phone: auth?.currentUser?.phoneNumber,
            userId: auth?.currentUser?.uid,
          });

          if (newUser) {
            const q = query(
              notificationCollectionRef,
              where("userId", "==", auth?.currentUser?.uid)
            );
            const querySnapshot = await getDocs(q);
            if (querySnapshot.docs[0] === undefined) {
              try {
                await addDoc(notificationCollectionRef, {
                  message: "Congratulations on creating your account",
                  created: serverTimestamp(),
                  read: false,
                  timeRead: null,
                  userId: auth?.currentUser?.uid,
                });
              } catch (error) {
                console.error(error);
              }
            }
            return toast.success("Sign In Success");
          }
        }
        try {
          await addDoc(notificationCollectionRef, {
            message: `new login on ${currentDate}`,
            created: serverTimestamp(),
            read: false,
            timeRead: null,
            userId: auth?.currentUser?.uid,
          });
        } catch (error) {
          console.error(error);
        }
        return toast.success("Sign In Success");
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col w-[400px] p-4 rounded-md shadow-md max-[460px]:w-screen">
      {isLoading && <Loading />}
      <Toaster />
      <h1 className="p-4 w-full font-bold text-2xl text-zinc-50 bg-teal-600 mb-6 flex item-center justify-center text-center">
        <FontAwesomeIcon className="mr-4" icon={faHouse} />
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
      {isSignUpActive && (
        <>
          <button
            className="w-full mb-4 rounded-sm bg-teal-600 text-zinc-50 border border-teal-600 p-4 hover:bg-zinc-50 hover:text-teal-600"
            onClick={signUp}
          >
            <FontAwesomeIcon className="mr-4" icon={faDoorOpen} />
            Sign Up
          </button>
          <button
            className="flex text-center items-center justify-center w-full bg-red-500 text-zinc-50 rounded-sm border border-red-500 p-4 hover:bg-zinc-50 hover:text-red-500"
            onClick={signInWithGoogle}
          >
            <FontAwesomeIcon className="mr-4" icon={faDoorOpen} />
            Sign Up With Google
          </button>
          <button className="mt-4" onClick={toggleSignUp}>
            Already have an account? Sign In
          </button>
        </>
      )}

      {!isSignUpActive && (
        <>
          <button
            className="w-full mb-4 rounded-sm bg-teal-600 text-zinc-50 border border-teal-600 p-4 hover:bg-zinc-50 hover:text-teal-600"
            onClick={signIn}
          >
            <FontAwesomeIcon className="mr-4" icon={faDoorOpen} />
            Sign In
          </button>
          <button
            className="flex text-center items-center justify-center w-full bg-red-500 text-zinc-50 rounded-sm border border-red-500 p-4 hover:bg-zinc-50 hover:text-red-500"
            onClick={signInWithGoogle}
          >
            <FontAwesomeIcon className="mr-4" icon={faDoorOpen} />
            Sign In With Google
          </button>
          <button className="mt-4" onClick={toggleSignUp}>
            Don't have an account? Sign Up
          </button>
        </>
      )}
    </div>
  );
};
