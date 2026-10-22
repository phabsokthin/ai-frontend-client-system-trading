"use client";

import { useState } from "react";
import { db } from "../../firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  setDoc,
  updateDoc,
  type CollectionReference,
  type DocumentData,
  type WithFieldValue,
  type UpdateData,
  type DocumentReference,
} from "firebase/firestore";

const useCollection = <T extends DocumentData = DocumentData>(
  collectionName: string
) => {
  const [isPending, setIsPending] = useState<boolean>(false);

  const collectionRef = collection(
    db,
    collectionName
  ) as CollectionReference<T>;


  const addcDocs = async (
    formDoc: WithFieldValue<T>
  ): Promise<DocumentReference<T> | null> => {
    setIsPending(true);

    try {
      return await addDoc(collectionRef, formDoc);
    } catch (err: unknown) {
      console.error("Error adding document:", err);
      return null;
    } finally {
      setIsPending(false);
    }
  };


  const setDocs = async (
    formDoc: WithFieldValue<T>,
    id: string
  ): Promise<boolean> => {
    setIsPending(true);

    try {
      await setDoc(doc(collectionRef, id), formDoc);
      return true;
    } catch (err: unknown) {
      console.error("Error setting document:", err);
      return false;
    } finally {
      setIsPending(false);
    }
  };

  // Update selected fields in an existing document
  const updateDocs = async (
    id: string,
    formDoc: UpdateData<T>
  ): Promise<boolean> => {
    setIsPending(true);

    try {
      await updateDoc(doc(collectionRef, id), formDoc);
      return true;
    } catch (err: unknown) {
      console.error("Error updating document:", err);
      return false;
    } finally {
      setIsPending(false);
    }
  };

  // Delete a document by ID
  const deleteDocs = async (docID: string): Promise<boolean> => {
    setIsPending(true);

    try {
      await deleteDoc(doc(collectionRef, docID));
      return true;
    } catch (err: unknown) {
      console.error("Error deleting document:", err);
      return false;
    } finally {
      setIsPending(false);
    }
  };

  return {
    addcDocs,
    addDoc: addcDocs,
    addDocs: addcDocs,
    setDocs,
    isPending,
    deleteDocs,
    updateDocs,
  };
};

export default useCollection;