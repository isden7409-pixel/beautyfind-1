import React, { useState } from 'react';
import { migrateSalonsWithOwners } from '../utils/migrateSalons';

interface MigrationPanelProps {
  language: 'cs' | 'en';
}

const MigrationPanel: React.FC<MigrationPanelProps> = ({ language }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<{
    success: number;
    failed: number;
    details: string[];
  } | null>(null);

  const translations = {
    cs: {
      title: 'Миграция данных',
      description: 'Эта утилита связывает существующие салоны с их владельцами',
      runButton: 'Запустить миграцию',
      running: 'Выполняется...',
      resultsTitle: 'Результаты миграции',
      success: 'Успешно',
      failed: 'Ошибок',
      details: 'Детали'
    },
    en: {
      title: 'Data Migration',
      description: 'This utility links existing salons with their owners',
      runButton: 'Run Migration',
      running: 'Running...',
      resultsTitle: 'Migration Results',
      success: 'Success',
      failed: 'Failed',
      details: 'Details'
    }
  };

  const t = translations[language];

  const handleRunMigration = async () => {
    setIsRunning(true);
    setResults(null);

    try {
      const migrationResults = await migrateSalonsWithOwners();
      setResults(migrationResults);
    } catch (error) {
      console.error('Migration error:', error);
      setResults({
        success: 0,
        failed: 1,
        details: [`Error: ${error}`]
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="migration-panel" style={{
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      margin: '20px 0',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>{t.title}</h3>
      <p>{t.description}</p>
      
      <button
        onClick={handleRunMigration}
        disabled={isRunning}
        className="btn btn-primary"
        style={{
          marginTop: '10px',
          padding: '10px 20px',
          cursor: isRunning ? 'not-allowed' : 'pointer',
          opacity: isRunning ? 0.6 : 1
        }}
      >
        {isRunning ? t.running : t.runButton}
      </button>

      {results && (
        <div style={{ marginTop: '20px' }}>
          <h4>{t.resultsTitle}</h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '10px',
            marginBottom: '15px'
          }}>
            <div style={{ 
              padding: '10px', 
              backgroundColor: '#d4edda', 
              borderRadius: '4px',
              border: '1px solid #c3e6cb'
            }}>
              <strong>{t.success}:</strong> {results.success}
            </div>
            <div style={{ 
              padding: '10px', 
              backgroundColor: '#f8d7da', 
              borderRadius: '4px',
              border: '1px solid #f5c6cb'
            }}>
              <strong>{t.failed}:</strong> {results.failed}
            </div>
          </div>
          
          <div>
            <strong>{t.details}:</strong>
            <ul style={{ 
              marginTop: '10px', 
              maxHeight: '300px', 
              overflowY: 'auto',
              backgroundColor: 'white',
              padding: '10px',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              {results.details.map((detail, index) => (
                <li key={index} style={{ 
                  marginBottom: '5px',
                  fontFamily: 'monospace'
                }}>
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default MigrationPanel;









