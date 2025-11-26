import { useCallback, useState, useEffect } from 'react';
import { useRealm, useQuery } from '@realm/react';
import { companyDetail } from '../realmSchemas';

const DEFAULT_COMPANY_ID = 'company_default';

export const useCompanyStore = () => {
  const realm = useRealm();
  const companies = useQuery<companyDetail>('Company');
  const [company, setCompany] = useState<companyDetail | null>(null);

  useEffect(() => {
    const comp = companies.find((c) => c._id === DEFAULT_COMPANY_ID);
    setCompany(comp || null);
  }, [companies]);

  const initializeDefaultCompany = useCallback(() => {
    try {
      const existing = realm.objectForPrimaryKey('Company', DEFAULT_COMPANY_ID);
      if (!existing) {
        realm.write(() => {
          realm.create('Company', {
            _id: DEFAULT_COMPANY_ID,
            companyName: 'Rs Hing',
            address: JSON.stringify({
              street: 'pathwari gali',
              city: 'Hathras',
              pincode: 204101,
              state: 'Uttar Pradesh',
              country: 'india',
            }),
            mobileNo: '1234567890',
            gstNo: '123456789012345',
            email: 'rajansingh@gmail.com',
          });
        });
      }
    } catch (e) {
      console.warn('Failed to initialize default company', e);
    }
  }, [realm]);

  const updateCompany = useCallback(
    (updates: Partial<companyDetail>) => {
      try {
        realm.write(() => {
          const comp = realm.objectForPrimaryKey('Company', DEFAULT_COMPANY_ID);
          if (comp) {
            Object.assign(comp, updates);
          }
        });
      } catch (e) {
        console.warn('Failed to update company', e);
      }
    },
    [realm]
  );

  const setCompanyData = useCallback(
    (data: companyDetail) => {
      try {
        realm.write(() => {
          realm.delete(
            realm.objectForPrimaryKey('Company', DEFAULT_COMPANY_ID)
          );
          realm.create('Company', {
            ...data,
            _id: DEFAULT_COMPANY_ID,
          });
        });
      } catch (e) {
        console.warn('Failed to set company', e);
      }
    },
    [realm]
  );

  return {
    company,
    initializeDefaultCompany,
    updateCompany,
    setCompanyData,
  };
};
