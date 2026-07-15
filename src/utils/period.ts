// Em src/utils/index.ts (adicionado ao final)
export const getPreviousPeriod = (startStr: string, endStr: string) => {
  const [sy, sm] = startStr.split('-').map(Number);
  const [ey, em] = endStr.split('-').map(Number);
  
  const startTotalMonths = sy * 12 + sm;
  const endTotalMonths = ey * 12 + em;
  const diffMonths = endTotalMonths - startTotalMonths + 1; // 1 month diff minimum
  
  const prevEndTotalMonths = startTotalMonths - 1;
  const prevStartTotalMonths = prevEndTotalMonths - diffMonths + 1;
  
  const py = Math.floor((prevStartTotalMonths - 1) / 12);
  const pm = ((prevStartTotalMonths - 1) % 12) + 1;
  
  const pey = Math.floor((prevEndTotalMonths - 1) / 12);
  const pem = ((prevEndTotalMonths - 1) % 12) + 1;
  
  return {
    prevStart: `${py}-${String(pm).padStart(2, '0')}`,
    prevEnd: `${pey}-${String(pem).padStart(2, '0')}`
  };
};
