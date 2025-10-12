/**
 * Утилита для миграции существующих салонов
 * Добавляет ownerId к салонам, которые были созданы до внедрения этого поля
 */

import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Связывает существующие салоны с их владельцами
 * Ищет пользователей типа 'salon' и связывает их с салонами по email
 */
export async function migrateSalonsWithOwners(): Promise<{
  success: number;
  failed: number;
  details: string[];
}> {
  const results = {
    success: 0,
    failed: 0,
    details: [] as string[]
  };

  try {
    // 1. Получаем всех пользователей типа 'salon'
    const usersQuery = query(
      collection(db, 'users'),
      where('type', '==', 'salon')
    );
    const usersSnapshot = await getDocs(usersQuery);
    
    console.log(`Найдено ${usersSnapshot.size} пользователей типа 'salon'`);

    // 2. Для каждого пользователя ищем салон по email
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userEmail = userData.email;
      const userId = userDoc.id;

      try {
        // Ищем салон с таким же email
        const salonsQuery = query(
          collection(db, 'salons'),
          where('email', '==', userEmail)
        );
        const salonsSnapshot = await getDocs(salonsQuery);

        if (!salonsSnapshot.empty) {
          const salonDoc = salonsSnapshot.docs[0];
          const salonData = salonDoc.data();

          // Проверяем, нет ли уже ownerId
          if (!salonData.ownerId) {
            // Обновляем салон, добавляя ownerId
            await updateDoc(doc(db, 'salons', salonDoc.id), {
              ownerId: userId
            });

            // Обновляем профиль пользователя, добавляя salonId
            await updateDoc(doc(db, 'users', userId), {
              salonId: salonDoc.id
            });

            results.success++;
            results.details.push(
              `✓ Связан салон "${salonData.name}" (${salonDoc.id}) с пользователем ${userEmail}`
            );
            console.log(`Успешно обновлен салон: ${salonData.name}`);
          } else {
            results.details.push(
              `⊙ Салон "${salonData.name}" уже имеет ownerId: ${salonData.ownerId}`
            );
            console.log(`Салон ${salonData.name} уже имеет ownerId`);
          }
        } else {
          results.failed++;
          results.details.push(
            `✗ Салон не найден для пользователя ${userEmail}`
          );
          console.log(`Салон не найден для email: ${userEmail}`);
        }
      } catch (error) {
        results.failed++;
        results.details.push(
          `✗ Ошибка при обработке пользователя ${userEmail}: ${error}`
        );
        console.error(`Ошибка при обработке ${userEmail}:`, error);
      }
    }

    console.log('\n=== Результаты миграции ===');
    console.log(`Успешно: ${results.success}`);
    console.log(`Ошибок: ${results.failed}`);
    
  } catch (error) {
    console.error('Критическая ошибка при миграции:', error);
    results.details.push(`✗ Критическая ошибка: ${error}`);
  }

  return results;
}

/**
 * Вспомогательная функция для запуска миграции из консоли браузера
 */
export async function runMigration() {
  console.log('Начало миграции салонов...');
  const results = await migrateSalonsWithOwners();
  
  console.log('\n=== Детали миграции ===');
  results.details.forEach(detail => console.log(detail));
  
  return results;
}









