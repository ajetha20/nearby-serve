import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  QuerySnapshot,
  DocumentData
} from "firebase/firestore";

import { db } from "../firebase";
import { Recipient, DeliveryRequest } from "../types";

/* =====================================================
   COLLECTION REFERENCES
===================================================== */

const recipientsRef = collection(db, "recipients");
const requestsRef = collection(db, "requests");
const volunteersRef = collection(db, "volunteers");


/* =====================================================
   RECIPIENTS
===================================================== */

// 🔴 Real-time listener
export const listenRecipients = (callback: (data: Recipient[]) => void) => {
  return onSnapshot(recipientsRef, (snap: QuerySnapshot<DocumentData>) => {
    const list: Recipient[] = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    })) as Recipient[];

    callback(list);
  });
};

// CREATE (Firestore auto-generates id)
export const addRecipient = async (data: Omit<Recipient, "id">) => {
  await addDoc(recipientsRef, data);
};

// UPDATE
export const updateRecipient = async (id: string, data: Partial<Recipient>) => {
  await updateDoc(doc(db, "recipients", id), data as any);
};

// DELETE
export const deleteRecipient = async (id: string) => {
  await deleteDoc(doc(db, "recipients", id));
};


/* =====================================================
   DELIVERY REQUESTS
===================================================== */

// 🔴 Real-time listener
export const listenRequests = (callback: (data: DeliveryRequest[]) => void) => {
  return onSnapshot(requestsRef, (snap: QuerySnapshot<DocumentData>) => {
    const list: DeliveryRequest[] = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    })) as DeliveryRequest[];

    callback(list);
  });
};

// CREATE REQUEST
export const addRequest = async (data: Omit<DeliveryRequest, "id">) => {
  await addDoc(requestsRef, data);
};


/* =====================================================
   DELIVERED → ADMIN PAYOUT LISTENER
===================================================== */

export const listenDeliveredRequests = (
  callback: (data: DeliveryRequest[]) => void
) => {
  return onSnapshot(requestsRef, (snap) => {
    const list: DeliveryRequest[] = snap.docs
      .map((d) => ({
        id: d.id,
        ...d.data(),
      }))
      .filter((r: any) => r.status === "delivered") as DeliveryRequest[];

    callback(list);
  });
};

export const markRequestPaid = async (id: string) => {
  await updateDoc(doc(db, "requests", id), {
    status: "paid",
  });
};


/* =====================================================
   VOLUNTEERS
===================================================== */

// 🔴 Real-time volunteers
export const listenVolunteers = (callback: (data: any[]) => void) => {
  return onSnapshot(volunteersRef, (snap) => {
    const list = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    callback(list);
  });
};

// CREATE VOLUNTEER
export const addVolunteer = async (data: any) => {
  await addDoc(volunteersRef, data);
};

// DELETE VOLUNTEER
export const deleteVolunteer = async (id: string) => {
  await deleteDoc(doc(db, "volunteers", id));
};
// ================= UPDATE REQUEST =================

// ================= UPDATE REQUEST =================

export const updateRequest = async (
  id: string,
  data: Partial<DeliveryRequest>
) => {
  await updateDoc(doc(db, "requests", id), data as any);
};
// ================= LOGIN =================

export const loginVolunteer = async (email: string) => {
  return new Promise<any>((resolve, reject) => {
    onSnapshot(volunteersRef, (snap) => {
      const user = snap.docs.find(
        d => d.data().email?.toLowerCase() === email.toLowerCase()
      );

      if (!user) reject("User not found");
      else resolve({ id: user.id, ...user.data() });
    });
  });
};
// ================= USER PROFILE =================
export const getUserProfile = async (uid: string) => {
  const snap = await getDoc(doc(db, "users", uid));

  if (!snap.exists()) return null;

  return snap.data();
};