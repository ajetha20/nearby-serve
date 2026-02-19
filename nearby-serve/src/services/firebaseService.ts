import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  QuerySnapshot,
  DocumentData
} from "firebase/firestore";

import { db } from "../firebase";
import { Recipient, DeliveryRequest } from "../types";

// COLLECTIONS
const recipientsRef = collection(db, "recipients");
const requestsRef = collection(db, "requests");


// ================= RECIPIENTS =================

// 🔴 LIVE LISTENER (MAIN MAGIC)
export const listenRecipients = (callback: (data: Recipient[]) => void) => {
  return onSnapshot(recipientsRef, (snap: QuerySnapshot<DocumentData>) => {
    const list: Recipient[] = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    })) as Recipient[];

    callback(list);
  });
};

export const addRecipient = async (data: Recipient) => {
  await addDoc(recipientsRef, data);
};

export const updateRecipient = async (id: string, data: Recipient) => {
  await updateDoc(doc(db, "recipients", id), data as any);
};

export const deleteRecipient = async (id: string) => {
  await deleteDoc(doc(db, "recipients", id));
};



// ================= REQUESTS =================

export const listenRequests = (callback: (data: DeliveryRequest[]) => void) => {
  return onSnapshot(requestsRef, (snap: QuerySnapshot<DocumentData>) => {
    const list: DeliveryRequest[] = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    })) as DeliveryRequest[];

    callback(list);
  });
};

export const addRequest = async (data: DeliveryRequest) => {
  await addDoc(requestsRef, data);
};
