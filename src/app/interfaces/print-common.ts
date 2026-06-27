// Print execution date
export enum PrintExecDateEnum {
  'normal' = 0,
  'retentionCurve' = 1,
  'executionDate' = 2,
}

export const getAllPrintExecDateString = (): { value: PrintExecDateEnum; label: string }[] => {
  return [
    { value: PrintExecDateEnum.normal, label: 'None' },
    { value: PrintExecDateEnum.retentionCurve, label: 'Respect Retention Curve' },
    { value: PrintExecDateEnum.executionDate, label: 'Specify Execution Date' },
  ];
};
