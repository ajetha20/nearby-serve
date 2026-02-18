import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore"
import { db } from "../firebase";
import { Recipient, DeliveryRequest } from "../types";

// COLLECTIONS
const recipientsRef = collection(db, "recipients");
const requestsRef = collection(db, "requests");

// ---------- RECIPIENTS ----------
export const getRecipients = async (): Promise<Recipient[]> => {
  const snap = await getDocs(recipientsRef);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Recipient));
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

// ---------- REQUESTS ----------
export const getRequests = async (): Promise<DeliveryRequest[]> => {
  const snap = await getDocs(requestsRef);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as DeliveryRequest));
};

export const addRequest = async (data: DeliveryRequest) => {
  await addDoc(requestsRef, data);
};
