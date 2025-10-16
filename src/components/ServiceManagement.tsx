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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{translations.title}</h2>
        <button
          onClick={handleAddNew}
          disabled={hasMasters && !selectedMasterId}
          className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          + {translations.addService}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Переключатель мастеров для салона */}
      {hasMasters && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            {translations.selectMaster}
          </label>
          <div className="flex gap-2 flex-wrap">
            {masters.map((master) => (
              <button
                key={master.id}
                onClick={() => setSelectedMasterId(master.id)}
                className={`px-4 py-2 rounded border ${
                  selectedMasterId === master.id
                    ? 'bg-pink-500 text-white border-pink-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {master.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500">
          {translations.loading}
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {translations.noServices}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {translations.noServicesDesc}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
    <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      {service.photoUrl && (
        <img
          src={service.photoUrl}
          alt={serviceName}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{serviceName}</h3>
        
        {serviceDescription && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {serviceDescription}
          </p>
        )}

        <div className="flex justify-between items-center mb-4">
          <div className="text-pink-600 font-semibold text-lg">
            {service.price} {language === 'cs' ? 'Kč' : 'CZK'}
          </div>
          <div className="text-sm text-gray-500">
            {service.duration} {translations.duration}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(service)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm"
          >
            {translations.edit}
          </button>
          <button
            onClick={() => onDelete(service)}
            className="flex-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          >
            {translations.delete}
          </button>
        </div>
      </div>
    </div>
  );
};




