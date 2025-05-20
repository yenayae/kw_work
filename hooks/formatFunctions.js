export function formatCustomerName(resident, payer) {
  if (resident.id === payer.id) {
    return resident.name;
  }

  return `${resident.name} c/o ${payer.name}`;
}
