import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { AppUser, CarbonProfile, PledgeAction, AIAnalysisResult } from "../types";

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error("Firestore Error Detailed Logs:", JSON.stringify(errInfo, null, 2));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Saves/creates the main User document in Firestore
 */
export async function saveUserDoc(uid: string, user: Omit<AppUser, "passwordHash">) {
  const path = `users/${uid}`;
  try {
    await setDoc(doc(db, "users", uid), {
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      targetGoalTons: user.targetGoalTons || 4.0,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Retrieves the main User document from Firestore
 */
export async function getUserDoc(uid: string): Promise<Omit<AppUser, "passwordHash"> | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) {
      return snap.data() as Omit<AppUser, "passwordHash">;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Saves Carbon Calculation Profile
 */
export async function saveProfileDoc(uid: string, profile: CarbonProfile) {
  const path = `users/${uid}/configs/profile`;
  try {
    await setDoc(doc(db, "users", uid, "configs", "profile"), profile);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Retrieves Carbon Calculation Profile
 */
export async function getProfileDoc(uid: string): Promise<CarbonProfile | null> {
  const path = `users/${uid}/configs/profile`;
  try {
    const snap = await getDoc(doc(db, "users", uid, "configs", "profile"));
    if (snap.exists()) {
      return snap.data() as CarbonProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Saves User Pledges list
 */
export async function savePledgesDoc(uid: string, pledges: PledgeAction[]) {
  const path = `users/${uid}/configs/pledges`;
  try {
    await setDoc(doc(db, "users", uid, "configs", "pledges"), { pledges });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Retrieves User Pledges list
 */
export async function getPledgesDoc(uid: string): Promise<PledgeAction[] | null> {
  const path = `users/${uid}/configs/pledges`;
  try {
    const snap = await getDoc(doc(db, "users", uid, "configs", "pledges"));
    if (snap.exists() && snap.data()?.pledges) {
      return snap.data().pledges as PledgeAction[];
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Saves AI analysis outcomes
 */
export async function saveAIAnalysisDoc(uid: string, result: AIAnalysisResult) {
  const path = `users/${uid}/configs/ai_analysis`;
  try {
    await setDoc(doc(db, "users", uid, "configs", "ai_analysis"), result);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Retrieves AI analysis outcomes
 */
export async function getAIAnalysisDoc(uid: string): Promise<AIAnalysisResult | null> {
  const path = `users/${uid}/configs/ai_analysis`;
  try {
    const snap = await getDoc(doc(db, "users", uid, "configs", "ai_analysis"));
    if (snap.exists()) {
      return snap.data() as AIAnalysisResult;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}
