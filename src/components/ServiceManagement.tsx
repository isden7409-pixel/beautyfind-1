/**
 * Компонент управления услугами
 * Для салонов и мастеров-фрилансеров
 */

import React, { useState, useEffect } from 'react';
import { Service, ServiceFormData } from '../types/booking';
import { Master } from '../types';
import {
  getServices,
  createService,
  updateService,
  deleteService,
} from '../firebase/bookingServices';
import { ServiceForm } from './ServiceForm';

interface ServiceManagementProps {
  providerId: string;
  providerType: 'salon' | 'master';
  masters?: Master[]; // для салонов с мастерами
  language: 'cs' | 'en';
}

export const ServiceManagement: React.FC<ServiceManagementProps> = ({
  providerId,
  providerType,
  masters = [],
  language,
}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedMasterId, setSelectedMasterId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const hasMasters = providerType === 'salon' && masters.length > 0;

  const t = {
    cs: {
      title: providerType === 'salon' ? 'Naše služby' : 'Moje služby',
      addService: 'Přidat službu',
      noServices: 'Zatím žádné služby',
      noServicesDesc: 'Klikněte na tlačítko níže pro přidání první služby',
      salonServices: 'Služby salonu',
      masterServices: 'Služby mistra',
      selectMaster: 'Vyberte mistra',
      allMasters: 'Všichni mistři',
      duration: 'min',
      edit: 'Upravit',
      delete: 'Smazat',
      confirmDelete: 'Opravdu chcete smazat tuto službu?',
      loading: 'Načítání...',
      optional: 'Volitelné',
    },
    en: {
      title: providerType === 'salon' ? 'Our Services' : 'My Services',
      addService: 'Add Service',
      noServices: 'No services yet',
      noServicesDesc: 'Click the button below to add your first service',
      salonServices: 'Salon Services',
      masterServices: 'Master Services',
      selectMaster: 'Select master',
      allMasters: 'All masters',
      duration: 'min',
      edit: 'Edit',
      delete: 'Delete',
      confirmDelete: 'Are you sure you want to delete this service?',
      loading: 'Loading...',
      optional: 'Optional',
    },
  };

  const translations = t[language];

  useEffect(() => {
    loadServices();
  }, [providerId, selectedMasterId]);

  const loadServices = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getServices(providerId, providerType, selectedMasterId || undefined);
      setServices(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveService = async (data: ServiceFormData) => {
    try {
      if (editingService) {
        // Редактирование
        await updateService(editingService.id, data);
      } else {
        // Создание
        await createService(
          providerId,
          providerType,
          data,
          hasMasters ? selectedMasterId || undefined : undefined
        );
      }

      setShowForm(false);
      setEditingService(undefined);
      await loadServices();
    } catch (err: any) {
      throw err;
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setShowForm(true);
  };

  const handleDelete = async (service: Service) => {
    if (!window.confirm(translations.confirmDelete)) {
      return;
    }

    try {
      await deleteService(service.id);
      await loadServices();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingService(undefined);
  };

  const handleAddNew = () => {
    setEditingService(undefined);
    setShowForm(true);
  };

  // Если показывается форма
  if (showForm) {
    return (
      <ServiceForm
        service={editingService}
        onSave={handleSaveService}
        onCancel={handleCancel}
        language={language}
      />
    );
  }

  return (
    <div className="service-management">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{translations.title}</h2>
        
        {/* Текст о том, что нет услуг - только когда нет услуг */}
        {!loading && services.length === 0 && (
          <div style={{ marginTop: '16px', marginBottom: '24px' }}>
            <p className="text-sm text-gray-500" style={{ fontWeight: 'bold' }}>
              {translations.noServices}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {translations.noServicesDesc}
            </p>
          </div>
        )}
        
        <div className="flex justify-end" style={{ marginTop: '16px' }}>
          <button
            onClick={handleAddNew}
            disabled={hasMasters && !selectedMasterId}
            className="schedule-button enable"
          >
            + {translations.addService}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Старый блок выбора мастера удалён (заменён новым ниже) */}

      {loading && (
        <div className="text-center py-8 text-gray-500">{translations.loading}</div>
      )}

      {/* Отступы под кнопкой и лейблом выбора мастера */}
      {hasMasters && (
        <div style={{ marginTop: '16px' }}>
          <div className="text-sm font-medium" style={{ marginBottom: '8px' }}>
            {translations.selectMaster}
          </div>
          <div className="flex gap-2 flex-wrap">
            {masters.map((master) => (
              <button
                key={master.id}
                onClick={() => setSelectedMasterId(master.id)}
                className={`px-4 py-2 rounded border ${
                  selectedMasterId === master.id
                    ? 'schedule-button active-master small'
                    : 'schedule-button secondary small'
                }`}
                style={{ marginRight: 12, marginBottom: 8 }}
              >
                {master.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Список услуг отображаем ПОД выбором мастера */}
      {!loading && services.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0" style={{ marginTop: '24px' }}>
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onEdit={handleEdit}
              onDelete={handleDelete}
              language={language}
              translations={translations}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Карточка услуги
interface ServiceCardProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
  language: 'cs' | 'en';
  translations: any;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onEdit,
  onDelete,
  language,
  translations,
}) => {
  const serviceName = language === 'cs' ? service.name_cs : (service.name_en || service.name_cs);
  const serviceDescription = language === 'cs'
    ? service.description_cs
    : (service.description_en || service.description_cs);

  return (
    <div className="service-card">
      <div className="service-card-content">
        <h3 className="service-card-title">{serviceName}</h3>
        
        {serviceDescription && (
          <p className="service-card-description">
            {serviceDescription}
          </p>
        )}

        <div className="service-card-price">
          {service.price} {language === 'cs' ? 'Kč' : 'CZK'}
        </div>
        <div className="service-card-duration">
          {service.duration} {translations.duration}
        </div>
      </div>

      {service.photoUrl && (
        <img
          src={service.photoUrl}
          alt={serviceName}
          className="service-card-photo"
        />
      )}

      <div className="service-card-actions">
        <button
          onClick={() => onEdit(service)}
          className="service-card-button service-card-button-edit"
        >
          {translations.edit}
        </button>
        <button
          onClick={() => onDelete(service)}
          className="service-card-button service-card-button-delete"
        >
          {translations.delete}
        </button>
      </div>
    </div>
  );
};




