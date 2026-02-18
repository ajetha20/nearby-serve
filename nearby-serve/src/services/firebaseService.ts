import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { Recipient, DeliveryRequest } from "../types";

// COLLECTION REFERENCES
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


// ---------- REALTIME LISTENERS ----------

// Live recipients updates (map pins instantly update)
export const listenRecipients = (callback: (data: Recipient[]) => void) => {
  return onSnapshot(recipientsRef, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Recipient[];

    callback(data);
  });
};

// Live donation requests updates
export const listenRequests = (callback: (data: DeliveryRequest[]) => void) => {
  return onSnapshot(requestsRef, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as DeliveryRequest[];

    callback(data);
  });
};
