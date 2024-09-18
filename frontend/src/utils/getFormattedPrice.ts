export default function getFormattedPrice(price: number): string {
    return price.toLocaleString('fr-FR', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 });
}