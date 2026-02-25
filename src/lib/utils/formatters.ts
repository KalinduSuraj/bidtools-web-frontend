export const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency
    }).format(amount);
};

export const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
};
