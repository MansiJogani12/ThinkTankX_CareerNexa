import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { dummyInterviews } from "@/constants";
import fs from "fs";
import path from "path";

const globalAny: any = global;

function createMockDb() {
  const dbFilePath = path.join(process.cwd(), "mock-db.json");

  if (!globalAny.mockDbCollections) {
    if (fs.existsSync(dbFilePath)) {
      try {
        globalAny.mockDbCollections = JSON.parse(fs.readFileSync(dbFilePath, "utf-8"));
      } catch (e) {
        console.error("Failed to parse mock-db.json", e);
      }
    }
    
    if (!globalAny.mockDbCollections) {
      globalAny.mockDbCollections = {
        users: [
          { id: "mock_uid", uid: "mock_uid", email: "test@example.com", name: "Demo User", role: "student" },
          { id: "mock_hr_uid", uid: "mock_hr_uid", email: "hr@company.com", name: "Demo HR", role: "company_admin", companyId: "mock_company_1" }
        ],
        interviews: [...dummyInterviews],
        feedback: [],
        companies: [
          { id: "mock_company_1", name: "Demo Corp", industry: "Technology", logoUrl: "" }
        ],
        job_requisitions: [],
        candidate_pool: [],
        cohorts: [],
        bulk_batches: []
      };
    }
  }

  const collections: Record<string, any[]> = globalAny.mockDbCollections;

  const saveDb = () => {
    try {
      fs.writeFileSync(dbFilePath, JSON.stringify(collections, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to save mock DB", e);
    }
  };

  const createQuery = (data: any[]) => {
    let result = [...data];
    const q = {
      where: (field: string, op: string, val: any) => {
        if (op === "==") result = result.filter(d => d[field] === val);
        if (op === "!=") result = result.filter(d => d[field] !== val);
        return q;
      },
      orderBy: () => q,
      limit: (n: number) => {
        result = result.slice(0, n);
        return q;
      },
      get: async () => ({
        empty: result.length === 0,
        docs: result.map(d => ({ id: d.id || Math.random().toString(), data: () => d }))
      })
    };
    return q;
  };

  return {
    collection: (name: string) => {
      if (!collections[name]) collections[name] = [];
      return {
        doc: (id?: string) => {
          const docId = id || Math.random().toString();
          return {
            get: async () => {
              const doc = collections[name].find(d => d.id === docId) || collections[name].find(d => d.uid === docId);
              return { exists: !!doc, id: docId, data: () => doc || {} };
            },
            set: async (data: any) => {
              const index = collections[name].findIndex(d => d.id === docId || d.uid === docId);
              if (index >= 0) collections[name][index] = { ...data, id: docId, uid: docId };
              else collections[name].push({ ...data, id: docId, uid: docId });
              saveDb();
            }
          };
        },
        add: async (data: any) => {
          const id = Math.random().toString();
          collections[name].push({ ...data, id });
          saveDb();
          return { id };
        },
        ...createQuery(collections[name])
      };
    }
  };
}

// Initialize Firebase Admin SDK
function initFirebaseAdmin() {
  const apps = getApps();

  try {
    if (!apps.length && process.env.FIREBASE_PRIVATE_KEY) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Replace newlines in the private key
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
      });
    }

    if (getApps().length > 0) {
      return {
        auth: getAuth(),
        db: getFirestore(),
      };
    }
  } catch (error) {
    console.error("Firebase Admin Initialization Error:", error);
  }

  console.log("USING MOCKED FIREBASE ADMIN SDK");
  
  // Return functional dummy objects to prevent module crash and allow offline testing
  return {
    auth: {
      getUserByEmail: async (email: string) => ({ uid: "mock_uid", email }),
      verifySessionCookie: async (cookie: string) => ({ uid: cookie }),
      createSessionCookie: async (idToken: string) => {
        try {
          // idToken is a JWT, we can extract the user_id (uid) from it
          const payload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
          return payload.user_id || "mock_uid";
        } catch (e) {
          return "mock_uid";
        }
      },
    } as any,
    db: createMockDb() as any,
  };
}

export const { auth, db } = initFirebaseAdmin();
