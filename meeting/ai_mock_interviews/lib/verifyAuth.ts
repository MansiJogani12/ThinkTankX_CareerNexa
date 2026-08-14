import { auth, db } from "@/firebase/admin";
import { NextRequest } from "next/server";

export async function verifyAuth(req: NextRequest) {
  try {
    let uid = "mock_uid"; // Fallback to mock uid for testing

    const sessionCookie = req.cookies.get("session")?.value;
    if (sessionCookie) {
      try {
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
        uid = decodedClaims.uid;
      } catch (e) {
        console.error("Session cookie verification failed, using mock_uid", e);
      }
    } else {
      const authHeader = req.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split("Bearer ")[1];
        try {
          // If it's an id token
          const decoded = await auth.verifyIdToken(token);
          uid = decoded.uid;
        } catch (e) {
          console.error("Token verification failed, using mock_uid", e);
        }
      }
    }

    // Get user from db
    const userDoc = await db.collection("users").doc(uid).get();
    
    if (!userDoc.exists) {
      // Create a mock user if it doesn't exist
      await db.collection("users").doc(uid).set({
        uid,
        freeRequestsUsed: 0,
        subscription: null,
      });
    }

    const userData = (await db.collection("users").doc(uid).get()).data();

    // Check if user has pro access
    const hasProAccess = () => {
      if (!userData.subscription) return false;
      return new Date() < new Date(userData.subscription);
    };

    const canMakeRequest = () => {
      return hasProAccess() || (userData.freeRequestsUsed || 0) < 3;
    };

    return {
      user: {
        uid,
        ...userData,
        hasProAccess,
        canMakeRequest,
      },
      error: null,
    };
  } catch (error) {
    return { user: null, error: "Authentication failed" };
  }
}

export async function incrementRequestCount(uid: string) {
  const userRef = db.collection("users").doc(uid);
  const doc = await userRef.get();
  if (doc.exists) {
    const data = doc.data();
    await userRef.set({
      ...data,
      freeRequestsUsed: (data.freeRequestsUsed || 0) + 1
    });
  }
}
