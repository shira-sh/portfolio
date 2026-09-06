import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Card } from '../components/Card';
import { LoadingState } from '../components/LoadingState';
import { useDepartmentsAndUnits } from '../hooks/useDepartments';
import { useEmployees } from '../hooks/useEmployees';

export function OrganizationPage() {
  const { departments, units, isLoading: orgLoading } = useDepartmentsAndUnits();
  const { employees, isLoading: employeesLoading } = useEmployees();
  const navigate = useNavigate();

  const countsByUnit = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of employees) {
      map.set(e.primaryUnitId, (map.get(e.primaryUnitId) ?? 0) + 1);
    }
    return map;
  }, [employees]);

  if (orgLoading || employeesLoading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: 'דשבורד', to: '/dashboard' }, { label: 'מבנה ארגוני' }]} />
      <div>
        <h1 className="text-xl font-bold text-gray-900">מבנה ארגוני</h1>
        <p className="mt-1 text-sm text-gray-500">
          {departments.length} מחלקות, {units.length} יחידות/אתרים, {employees.length} עובדים
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {departments.map((dept) => {
          const deptUnits = units.filter((u) => u.departmentId === dept.id);
          const deptEmployeeCount = employees.filter((e) => e.primaryDepartmentId === dept.id).length;
          return (
            <Card
              key={dept.id}
              title={dept.name}
              actions={<span className="text-xs text-gray-400">{deptEmployeeCount} עובדים</span>}
            >
              <div className="space-y-2">
                {deptUnits.map((unit) => (
                  <button
                    key={unit.id}
                    onClick={() => navigate(`/employees?departmentId=${dept.id}&unitId=${unit.id}`)}
                    className="flex w-full items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-right text-sm hover:bg-gray-100"
                  >
                    <span className="flex items-center gap-2 text-gray-700">
                      <MapPin size={14} className="text-gray-400" />
                      {unit.name}
                    </span>
                    <span className="text-xs text-gray-400">{countsByUnit.get(unit.id) ?? 0} עובדים</span>
                  </button>
                ))}
                {deptUnits.length === 0 && (
                  <div className="flex items-center gap-2 py-2 text-xs text-gray-400">
                    <Building2 size={14} />
                    אין יחידות מוגדרות במחלקה זו
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
