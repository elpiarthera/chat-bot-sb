import React, { useState, useEffect } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { UserGroup } from '@/lib/types';
import { MultiSelect } from '@/components/ui/multi-select';
import { FormikProps } from 'formik';

interface IsPublicGroupSelectorProps {
  formikProps: FormikProps<any>;
  objectName?: string;
  publicToWhom?: string;
  enforceGroupSelection?: boolean;
}

export const IsPublicGroupSelector: React.FC<IsPublicGroupSelectorProps> = ({
  formikProps,
  objectName = 'Resource',
  publicToWhom = 'everyone',
  enforceGroupSelection = false,
}) => {
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const { values, setFieldValue, errors, touched } = formikProps;
  const isPublic = values.is_public;

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/admin/groups');
        if (!response.ok) throw new Error('Failed to fetch groups');
        const data = await response.json();
        setGroups(data);
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const handleAccessTypeChange = (value: string) => {
    const newIsPublic = value === 'public';
    setFieldValue('is_public', newIsPublic);
    
    // If switching to public, clear selected groups
    if (newIsPublic) {
      setFieldValue('groups', []);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">Access Type</h3>
        <RadioGroup
          defaultValue={isPublic ? 'public' : 'restricted'}
          onValueChange={handleAccessTypeChange}
          className="flex flex-col space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="public" id="public" />
            <Label htmlFor="public">Public ({objectName} available to {publicToWhom})</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="restricted" id="restricted" />
            <Label htmlFor="restricted">Restricted ({objectName} available to selected groups only)</Label>
          </div>
        </RadioGroup>
      </div>

      {!isPublic && (
        <div>
          <h3 className="text-sm font-medium mb-2">User Groups</h3>
          {loading ? (
            <p className="text-sm text-gray-500">Loading groups...</p>
          ) : (
            <>
              <MultiSelect
                options={groups.map(group => ({
                  label: group.name,
                  value: group.id.toString(),
                }))}
                selected={values.groups.map((id: number) => id.toString())}
                onChange={values => setFieldValue('groups', values.map(v => parseInt(v, 10)))}
                placeholder="Select groups..."
              />
              {enforceGroupSelection && !isPublic && values.groups.length === 0 && (
                <p className="text-sm text-red-500 mt-1">
                  Please select at least one group or switch to public access
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}; 