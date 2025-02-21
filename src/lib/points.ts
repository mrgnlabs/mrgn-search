import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

import { PointsData } from "@/lib/types";

const FIREBASE_CONFIG = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(FIREBASE_CONFIG);
const db = getFirestore(app);

async function getWalletPoints(walletAddress: string): Promise<PointsData> {
  const defaultData: PointsData = {
    owner: walletAddress,
    depositPoints: 0,
    borrowPoints: 0,
    referralPoints: 0,
    totalPoints: 0,
    rank: null,
  };

  try {
    const pointsDoc = await getDoc(doc(db, "points", walletAddress));
    const pointsData = pointsDoc.data();

    if (!pointsData) {
      return defaultData;
    }

    return {
      owner: pointsData.owner,
      depositPoints: Number(
        pointsData.total_activity_deposit_points.toFixed(4),
      ),
      borrowPoints: Number(pointsData.total_activity_borrow_points.toFixed(4)),
      referralPoints: Number(
        (
          pointsData.total_referral_deposit_points +
          pointsData.total_referral_borrow_points
        ).toFixed(4),
      ),
      totalPoints:
        pointsData.total_activity_deposit_points +
        pointsData.total_activity_borrow_points +
        pointsData.total_referral_deposit_points +
        pointsData.total_referral_borrow_points +
        (pointsData.socialPoints || 0),
      rank: pointsData.rank ? pointsData.rank - 1 : null,
    };
  } catch (error) {
    console.error("Error fetching points data:", error);
    return defaultData;
  }
}

export { getWalletPoints };
export type { PointsData };
