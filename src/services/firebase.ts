import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Firestore
} from 'firebase/firestore';
import { ScoreRecord } from '../types/game';

/**
 * Firebase Firestore Configuration
 *
 * For GitHub Pages or standalone deployment:
 * 1. Create a Firebase project at https://console.firebase.google.com/
 * 2. Add a Web App and copy the firebaseConfig values here, OR provide them via VITE_FIREBASE_* env variables.
 * 3. In Firestore Database -> Rules, set:
 *    rules_version = '2';
 *    service cloud.firestore {
 *      match /databases/{database}/documents {
 *        match /scores/{docId} {
 *          allow read: if true;
 *          allow create: if request.resource.data.name is string
 *                       && request.resource.data.score is number;
 *        }
 *      }
 *    }
 */

const DEFAULT_CONFIG = {
  apiKey: "AIzaSyDDDC-KfLl4Jw0FBGJRvO5JqElhsR-w1hE",
  authDomain: "moon-phase-game-ccd21.firebaseapp.com",
  projectId: "moon-phase-game-ccd21",
  storageBucket: "moon-phase-game-ccd21.firebasestorage.app",
  messagingSenderId: "402024479689",
  appId: "1:402024479689:web:e353b24d005a2fd4154618"
};

const DEFAULT_CONFIG = firebaseConfig;

// Check if config has valid project information (not empty or default placeholder)
export function isFirebaseConfigured(): boolean {
  if (typeof window !== 'undefined' && (window as unknown as { FIREBASE_CONFIG?: Record<string, string> }).FIREBASE_CONFIG?.projectId) {
    return true;
  }
  return Boolean(DEFAULT_CONFIG.projectId && DEFAULT_CONFIG.apiKey && !DEFAULT_CONFIG.apiKey.includes('YOUR_'));
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

function getDbInstance(): Firestore | null {
  if (!isFirebaseConfigured()) return null;
  if (db) return db;

  try {
    const config = (typeof window !== 'undefined' && (window as unknown as { FIREBASE_CONFIG?: Record<string, string> }).FIREBASE_CONFIG) || DEFAULT_CONFIG;
    app = getApps().length === 0 ? initializeApp(config) : getApp();
    db = getFirestore(app);
    return db;
  } catch (err) {
    console.warn('[Firebase] Initialization error, using localStorage fallback:', err);
    return null;
  }
}

const LOCAL_STORAGE_KEY = 'moonGameScoresRetro';

// Helper: load from localStorage
export function getLocalScores(): ScoreRecord[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

// Helper: save to localStorage
export function saveLocalScores(records: ScoreRecord[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records.slice(0, 10)));
  } catch (err) {
    console.warn('[Storage] localStorage save failed:', err);
  }
}

/**
 * Fetch top scores from Firestore, with graceful fallback to localStorage.
 * Includes a 4-second timeout to prevent UI freezes on restricted school Wi-Fi networks.
 */
export async function fetchTopScores(): Promise<{ records: ScoreRecord[]; source: 'firestore' | 'local' }> {
  const firestoreDb = getDbInstance();
  const localList = getLocalScores();

  if (!firestoreDb) {
    return { records: localList, source: 'local' };
  }

  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Firebase network timeout')), 4000)
    );

    const queryPromise = (async () => {
      const q = query(collection(firestoreDb, 'scores'), orderBy('score', 'desc'), limit(15));
      const snapshot = await getDocs(q);
      const results: ScoreRecord[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        results.push({
          id: docSnap.id,
          name: data.name || '달탐험가',
          score: typeof data.score === 'number' ? data.score : 0,
          date: data.date || '',
          accuracy: typeof data.accuracy === 'number' ? data.accuracy : 0
        });
      });
      return results;
    })();

    const firestoreScores = await Promise.race([queryPromise, timeoutPromise]);

    if (firestoreScores.length > 0) {
      // Keep local copy synced
      saveLocalScores(firestoreScores);
      return { records: firestoreScores.slice(0, 10), source: 'firestore' };
    }

    return { records: localList, source: 'local' };
  } catch (err) {
    console.warn('[Firebase] fetchTopScores failed, using localStorage:', err);
    return { records: localList, source: 'local' };
  }
}

/**
 * Save new score to Firestore and localStorage.
 */
export async function recordNewScore(newRecord: ScoreRecord): Promise<{ success: boolean; savedToFirebase: boolean }> {
  // 1. Always update local storage first for instant feedback
  const localList = getLocalScores();
  const updatedLocal = [...localList, newRecord]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  saveLocalScores(updatedLocal);

  const firestoreDb = getDbInstance();
  if (!firestoreDb) {
    return { success: true, savedToFirebase: false };
  }

  try {
    await addDoc(collection(firestoreDb, 'scores'), {
      name: newRecord.name,
      score: newRecord.score,
      accuracy: newRecord.accuracy,
      date: newRecord.date,
      createdAt: serverTimestamp()
    });
    return { success: true, savedToFirebase: true };
  } catch (err) {
    console.warn('[Firebase] recordNewScore Firestore save failed, saved to local only:', err);
    return { success: true, savedToFirebase: false };
  }
}
