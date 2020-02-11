const OBJECT_NORMAL_MAP = [
  'TheWorld:PersistentLevel.CrowdActor_TA',
  'TheWorld:PersistentLevel.CrowdManager_TA',
  'TheWorld:PersistentLevel.VehiclePickup_Boost_TA',
  'TheWorld:PersistentLevel.BreakOutActor_Platform_TA'
];

export function normalizeObject(name: string): string {
  for (const m of OBJECT_NORMAL_MAP) {
    if (name.indexOf(m) > -1) {
      return m;
    }
  }
  return name;
}
