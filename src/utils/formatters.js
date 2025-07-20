export const formatCurrency = (amount) => {
  return amount.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'MAD'
  });
};
