import { db } from '../firebase/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit
} from 'firebase/firestore';

// Tournament Services
export const getTournament = async (tournamentId) => {
  try {
    const tournamentDoc = await getDoc(doc(db, 'tournaments', tournamentId));
    if (tournamentDoc.exists()) {
      return { id: tournamentDoc.id, ...tournamentDoc.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching tournament:', error);
    throw error;
  }
};

export const getActiveTournaments = async () => {
  try {
    const tournamentsQuery = query(
      collection(db, 'tournaments'),
      where('status', 'in', ['upcoming', 'inProgress']),
      orderBy('date', 'asc')
    );
    
    const snapshot = await getDocs(tournamentsQuery);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      
      // Add document ID to the returned object
      return {
        id: doc.id,
        ...data,
        // We don't convert the date here, will handle it in the component
      };
    });
  } catch (error) {
    console.error('Error fetching active tournaments:', error);
    throw error;
  }
};

// Participant Services
export const getParticipantProfile = async (userId, tournamentId) => {
  try {
    const participantsQuery = query(
      collection(db, 'participants'),
      where('userId', '==', userId),
      where('tournamentId', '==', tournamentId)
    );
    
    const snapshot = await getDocs(participantsQuery);
    
    if (snapshot.empty) {
      return null;
    }
    
    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data()
    };
  } catch (error) {
    console.error('Error fetching participant profile:', error);
    throw error;
  }
};

export const updateParticipantProfile = async (participantId, profileData) => {
  try {
    await updateDoc(doc(db, 'participants', participantId), {
      ...profileData,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error updating participant profile:', error);
    throw error;
  }
};

export const submitArmyList = async (participantId, armyList) => {
  try {
    await updateDoc(doc(db, 'participants', participantId), {
      armyList,
      listStatus: 'submitted',
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error submitting army list:', error);
    throw error;
  }
};

export const updateParticipationStatus = async (participantId, status) => {
  try {
    await updateDoc(doc(db, 'participants', participantId), {
      participationStatus: status,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error updating participation status:', error);
    throw error;
  }
};

// Roster Services
export const getTournamentRoster = async (tournamentId) => {
  try {
    const participantsQuery = query(
      collection(db, 'participants'),
      where('tournamentId', '==', tournamentId)
    );
    
    const snapshot = await getDocs(participantsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching tournament roster:', error);
    throw error;
  }
};

// Pairings Services
export const getRoundPairings = async (tournamentId, roundNumber) => {
  try {
    // First, get the round document
    const roundsQuery = query(
      collection(db, 'rounds'),
      where('tournamentId', '==', tournamentId),
      where('roundNumber', '==', roundNumber)
    );
    
    const roundSnapshot = await getDocs(roundsQuery);
    
    if (roundSnapshot.empty) {
      return [];
    }
    
    const roundId = roundSnapshot.docs[0].id;
    
    // Then, get the pairings for this round
    const pairingsQuery = query(
      collection(db, 'pairings'),
      where('tournamentId', '==', tournamentId),
      where('roundId', '==', roundId),
      orderBy('tableNumber', 'asc')
    );
    
    const pairingsSnapshot = await getDocs(pairingsQuery);
    
    // Get all the participant IDs from the pairings
    const participantIds = [];
    pairingsSnapshot.docs.forEach(doc => {
      const pairing = doc.data();
      participantIds.push(pairing.player1Id, pairing.player2Id);
    });
    
    // Fetch all participant details in one batch
    const participantsQuery = query(
      collection(db, 'participants'),
      where('id', 'in', participantIds)
    );
    
    const participantsSnapshot = await getDocs(participantsQuery);
    
    // Create a map of participant IDs to their details
    const participantsMap = {};
    participantsSnapshot.docs.forEach(doc => {
      const participant = doc.data();
      participantsMap[doc.id] = participant;
    });
    
    // Build the pairings with player details
    return pairingsSnapshot.docs.map(doc => {
      const pairing = doc.data();
      return {
        id: doc.id,
        ...pairing,
        player1: participantsMap[pairing.player1Id],
        player2: participantsMap[pairing.player2Id]
      };
    });
  } catch (error) {
    console.error('Error fetching round pairings:', error);
    throw error;
  }
};

// Placings Services
export const getTournamentPlacings = async (tournamentId) => {
  try {
    const participantsQuery = query(
      collection(db, 'participants'),
      where('tournamentId', '==', tournamentId)
    );
    
    const snapshot = await getDocs(participantsQuery);
    
    if (snapshot.empty) {
      return [];
    }
    
    const participants = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort by number of wins, then by total battle points
    participants.sort((a, b) => {
      // First, sort by number of wins (descending)
      const winsA = a.wins || 0;
      const winsB = b.wins || 0;
      
      if (winsB !== winsA) {
        return winsB - winsA;
      }
      
      // If wins are equal, sort by total battle points (descending)
      const bpA = a.totalBattlePoints || 0;
      const bpB = b.totalBattlePoints || 0;
      
      return bpB - bpA;
    });
    
    // Add rank to each participant
    return participants.map((participant, index) => ({
      ...participant,
      rank: index + 1
    }));
  } catch (error) {
    console.error('Error fetching tournament placings:', error);
    throw error;
  }
};

// User Services
export const createUserProfile = async (userId, userData) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (userId) => {
  try {
    console.log("Fetching user profile for ID:", userId);
    const userDoc = await getDoc(doc(db, 'users', userId));
    console.log("User document exists:", userDoc.exists());
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      console.log("User document data:", data);
      return { id: userDoc.id, ...data };
    } else {
      console.log("No user document found");
      return null;
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId, profileData) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...profileData,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const getUserEvents = async (userId) => {
  try {
    // First, get all participants entries for this user
    const participantsQuery = query(
      collection(db, 'participants'),
      where('userId', '==', userId)
    );
    
    const participantsSnapshot = await getDocs(participantsQuery);
    
    if (participantsSnapshot.empty) {
      return [];
    }
    
    // Extract tournament IDs
    const tournamentIds = participantsSnapshot.docs.map(doc => doc.data().tournamentId);
    
    // Fetch all these tournaments
    const tournaments = [];
    
    // Firebase doesn't support 'in' queries with more than 10 items, so we'll do it in batches if needed
    const batches = [];
    for (let i = 0; i < tournamentIds.length; i += 10) {
      batches.push(tournamentIds.slice(i, i + 10));
    }
    
    for (const batch of batches) {
      const tournamentsQuery = query(
        collection(db, 'tournaments'),
        where('__name__', 'in', batch)
      );
      
      const tournamentsSnapshot = await getDocs(tournamentsQuery);
      
      tournamentsSnapshot.docs.forEach(doc => {
        tournaments.push({
          id: doc.id,
          ...doc.data()
        });
      });
    }
    
    return tournaments;
  } catch (error) {
    console.error('Error fetching user events:', error);
    throw error;
  }
};

export const registerForTournament = async (userId, tournamentId, playerData) => {
  try {
    // Check if the user is already registered for this tournament
    const existingQuery = query(
      collection(db, 'participants'),
      where('userId', '==', userId),
      where('tournamentId', '==', tournamentId)
    );
    
    const existingSnapshot = await getDocs(existingQuery);
    
    if (!existingSnapshot.empty) {
      // User is already registered
      return { success: false, message: 'You are already registered for this tournament.' };
    }
    
    // Register the user for the tournament
    const participantRef = await addDoc(collection(db, 'participants'), {
      userId,
      tournamentId,
      ...playerData,
      listStatus: 'unsubmitted',
      participationStatus: 'registered',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return { 
      success: true, 
      participantId: participantRef.id,
      message: 'Successfully registered for the tournament!' 
    };
  } catch (error) {
    console.error('Error registering for tournament:', error);
    throw error;
  }
};