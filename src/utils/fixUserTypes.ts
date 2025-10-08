import { db } from '../firebase/config';
import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';

/**
 * Исправляет неправильные типы пользователей в Firebase
 * Находит пользователей с email содержащим 'master' но с типом 'salon'
 * и исправляет их тип на 'master'
 */
export async function fixMasterUserTypes(): Promise<{ success: number; errors: string[] }> {
  const results = { success: 0, errors: [] as string[] };
  
  try {
    console.log('Starting fix for master user types...');
    
    // Ищем всех пользователей с типом 'salon'
    const usersQuery = query(collection(db, 'users'), where('type', '==', 'salon'));
    const usersSnapshot = await getDocs(usersQuery);
    
    console.log(`Found ${usersSnapshot.size} users with type 'salon'`);
    
    for (const userDoc of usersSnapshot.docs) {
      try {
        const userData = userDoc.data();
        const userEmail = userData.email;
        
        // Проверяем, является ли это мастером по email
        if (userEmail && userEmail.includes('master')) {
          console.log(`Fixing user type for: ${userEmail}`);
          
          // Обновляем тип на 'master'
          await updateDoc(doc(db, 'users', userDoc.id), {
            type: 'master',
            updatedAt: new Date()
          });
          
          results.success++;
          console.log(`✓ Fixed user type for: ${userEmail}`);
        }
      } catch (error) {
        const errorMsg = `Error fixing user ${userDoc.id}: ${error}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
      }
    }
    
    console.log(`Fix completed. Success: ${results.success}, Errors: ${results.errors.length}`);
    
  } catch (error) {
    const errorMsg = `Error during fix: ${error}`;
    console.error(errorMsg);
    results.errors.push(errorMsg);
  }
  
  return results;
}

/**
 * Проверяет и исправляет конкретного пользователя по email
 */
export async function fixSpecificUserType(email: string, correctType: 'master' | 'salon' | 'client'): Promise<boolean> {
  try {
    console.log(`Fixing user type for: ${email} to ${correctType}`);
    
    // Ищем пользователя по email
    const usersQuery = query(collection(db, 'users'), where('email', '==', email));
    const usersSnapshot = await getDocs(usersQuery);
    
    if (usersSnapshot.empty) {
      console.log(`User with email ${email} not found`);
      return false;
    }
    
    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();
    
    if (userData.type === correctType) {
      console.log(`User ${email} already has correct type: ${correctType}`);
      return true;
    }
    
    // Обновляем тип
    await updateDoc(doc(db, 'users', userDoc.id), {
      type: correctType,
      updatedAt: new Date()
    });
    
    console.log(`✓ Fixed user type for ${email}: ${userData.type} -> ${correctType}`);
    return true;
    
  } catch (error) {
    console.error(`Error fixing user ${email}:`, error);
    return false;
  }
}
